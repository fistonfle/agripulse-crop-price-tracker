# Deploying to production

Merging to `main` deploys. The [CD workflow](../.github/workflows/cd.yml) runs
four jobs in order, and any failing job stops the deploy:

1. **CI checks** — calls [`ci.yml`](../.github/workflows/ci.yml), the same lint,
   test and build jobs that guard a pull request.
2. **Read infrastructure outputs** — reads the registry host and the VM
   addresses from the Terraform state in HCP Terraform.
3. **Build and push images** — builds the API and web images and pushes them to
   the private registry, tagged with the commit SHA and `latest`.
4. **Deploy** — opens the bastion for the runner's own address, runs the
   Ansible playbook against the app VM through the bastion, requests the live
   URL, and closes the bastion again. The closing step runs even when an
   earlier step fails.

Images are tagged `<registry>/agripulse-api:<commit-sha>` and
`<registry>/agripulse-web:<commit-sha>`, so every deploy is traceable to one
commit and a rollback is a redeploy of an older tag.

## Prerequisites

The infrastructure must already exist: `terraform apply` in [`terraform/`](../terraform)
has been run, and the workspace holds state. The CD workflow reads the
addresses from that state and fails with a clear message if the outputs are
empty.

## Repository secrets

Add these under **Settings → Secrets and variables → Actions → Secrets**.

| Secret | What it is |
| --- | --- |
| `AZURE_CLIENT_ID` | Application (client) ID of the deploy identity |
| `AZURE_TENANT_ID` | Directory (tenant) ID |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription ID |
| `AZURE_SSH_PRIVATE_KEY` | Private key matching `admin_ssh_public_key` in Terraform |
| `TF_API_TOKEN` | HCP Terraform API token, to read the state outputs |
| `AGRIPULSE_POSTGRES_PASSWORD` | Database password, the same one given to Terraform |
| `AGRIPULSE_JWT_SECRET` | Secret that signs the login tokens |

One optional variable, under **Variables**: `AZURE_ADMIN_USERNAME`, if the VM
administrator is not `azureuser`.

No credential is stored in the repository. Azure sign-in uses OpenID Connect,
so there is no client secret to rotate.

## Creating the deploy identity

Run these once, signed in with `az login`. They create an application that
GitHub can sign in as, allow it to push to the registry, and trust only this
repository's `main` branch.

```bash
az ad app create --display-name agripulse-cd --query appId -o tsv
```

Keep that app ID; it is `AZURE_CLIENT_ID`. Then:

```bash
az ad sp create --id <app-id>
```

Give it two roles, both scoped to the AgriPulse resource group: `AcrPush` to
push images, and `Network Contributor` to open and close the bastion rule
during a deploy. **The resource group has to exist first**, so run these after
the first `terraform apply`:

```bash
SCOPE="/subscriptions/$(az account show --query id -o tsv)/resourceGroups/rg-agripulse"
az role assignment create --assignee <app-id> --role AcrPush --scope "$SCOPE"
az role assignment create --assignee <app-id> --role "Network Contributor" --scope "$SCOPE"
```

Trust this repository, and nothing else. Two credentials are needed, because
the two jobs that sign in to Azure present different subjects: `build-and-push`
runs on the `main` branch, while `deploy` runs in the `production` environment.

```bash
az ad app federated-credential create --id <app-id> --parameters '{
  "name": "github-main",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:fistonfle/agripulse-crop-price-tracker:ref:refs/heads/main",
  "audiences": ["api://AzureADTokenExchange"]
}'
```

```bash
az ad app federated-credential create --id <app-id> --parameters '{
  "name": "github-production",
  "issuer": "https://token.actions.githubusercontent.com",
  "subject": "repo:fistonfle/agripulse-crop-price-tracker:environment:production",
  "audiences": ["api://AzureADTokenExchange"]
}'
```

A job that signs in to Azure from a new environment needs its own credential
with that environment's subject, or the sign-in fails with no matching
federated identity.

Read the tenant and subscription IDs for the other two secrets:

```bash
az account show --query '{tenant: tenantId, subscription: id}' -o tsv
```

The SSH key is the private half of the key pair Terraform was given. Paste the
whole file, `-----BEGIN` and `-----END` lines included:

```bash
cat ~/.ssh/agripulse_azure
```

## Why the bastion opens and closes

`admin_ssh_cidrs` in Terraform limits SSH on the bastion to the team's own
addresses. GitHub-hosted runners get a different public address on every run,
so the deploy job adds a rule for its own address at priority 150, does its
work, and deletes the rule in a step marked `if: always()`. The bastion is
never left open to a broad range, and nothing is permanently allowed.

## The GitHub environment

The deploy job runs in an environment called `production`, so the repository's
Environments page shows the live URL and the deployment history. Add required
reviewers there if a deploy should wait for approval.

## Running it

A merge to `main` is the normal trigger. The workflow can also be started by
hand from the Actions tab (**Run workflow**), which is useful for redeploying
without a code change.

## What the playbook receives

The deploy job passes these to Ansible:

| Variable | Value |
| --- | --- |
| `agripulse_image_tag` | The commit SHA that was just built |
| `agripulse_acr_login_server` | Registry host to pull from |
| `agripulse_database_fqdn` | Managed PostgreSQL host |

SSH goes through the bastion using an `~/.ssh/config` entry with `ProxyJump`,
so the playbook connects to the app VM's private IP without extra arguments.

## If a deploy fails

- **"Terraform output … is empty"** — the infrastructure has not been applied,
  or `TF_API_TOKEN` cannot read the workspace.
- **Azure sign-in fails** — no federated credential matches the token subject.
  `build-and-push` presents the `main` branch subject and `deploy` presents the
  `production` environment subject, so both credentials must exist.
- **"AuthorizationFailed" when pushing or changing the NSG** — the two role
  assignments above were not made after the first `terraform apply`.
- **SSH fails at "Set up SSH through the bastion"** — the temporary rule was
  not created. Check that the deploy identity has `Network Contributor` on the
  resource group, and that `AZURE_SSH_PRIVATE_KEY` matches the public key given
  to Terraform.
- **The live check fails** — the containers started but the site did not
  answer. Check the load balancer health probe (it requests `/health`) and the app NSG.

## The health signal

The load balancer probes `GET /health` on the website port, not `/`. nginx passes
that path to the API, which also checks the database:

| What is wrong | `/health` answers | Load balancer |
| ------------- | ----------------- | ------------- |
| Nothing | `200 {"status":"ok","database":"ok"}` | healthy, sends traffic |
| Database unreachable | `503 {"status":"error","database":"unreachable"}` | unhealthy, stops traffic |
| API container stopped | `502 Bad Gateway` from nginx | unhealthy, stops traffic |

`/` would have said 200 in all three cases, because it is only the static React
page. To see the signal from outside, without SSH:

```sh
curl -i http://<app_url host>:5173/health
```

To prove the probe reacts, stop the API on the VM (`sudo docker stop agripulse-api`),
wait about 15 seconds (2 probes, 5 seconds apart), and the backend shows as
unhealthy under the load balancer's Insights in the Azure portal, and `curl`
above returns 502. Run `sudo docker start agripulse-api` and it returns to 200
and healthy again.
