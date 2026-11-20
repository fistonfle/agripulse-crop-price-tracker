# AgriPulse VM configuration with Ansible

The playbook takes the private application VM from "Terraform just made it" to
"running the image CI built". It pulls the tagged images from the private
registry and points the app at the managed PostgreSQL server. No source code is
cloned on the VM and no database container runs there.

## What the playbook does

1. **docker** — installs Docker, the Compose plugin and git, and waits for
   cloud-init to finish so apt is not locked.
2. **security** — ufw firewall (SSH and the website port only), SSH hardened to
   keys and no root login.
3. **app** — signs in to the registry with the VM's managed identity, writes
   `.env` and the compose file, creates the database schema if the database is
   empty, pulls the images and starts them, then checks that the site, the API
   and the database all answer.

It is safe to run again: a second run reports `changed=0`.

## How the VM is reached

The application VM has no public IP. Every connection goes through the bastion
with a `ProxyCommand`, which the inventory adds when `AGRIPULSE_BASTION_IP` is
set. Leave that variable unset only if your `~/.ssh/config` already knows the
route.

## Prerequisites

- Ansible 2.16 or later, and the collections in `requirements.yml`:
  `ansible-galaxy collection install -r requirements.yml`
- The infrastructure applied from [`../terraform`](../terraform)
- The private key matching `admin_ssh_public_key`
- Images already in the registry, tagged with the commit SHA. The CD workflow
  pushes them; see [`../docs/deployment.md`](../docs/deployment.md).

## 1. Take the addresses from Terraform

```sh
export AGRIPULSE_VM_IP="$(terraform -chdir=../terraform output -raw app_private_ip)"
export AGRIPULSE_BASTION_IP="$(terraform -chdir=../terraform output -raw bastion_public_ip)"
export AGRIPULSE_SSH_KEY=~/.ssh/agripulse_azure   # optional, this is the default
export AGRIPULSE_SSH_USER=azureuser               # optional, this is the default
```

## 2. Set the secrets

These are read from your environment and written to the VM's `.env` at mode
0600. They are never committed. The playbook refuses to run if they are missing,
shorter than 16 characters, or still the development defaults.

```sh
export AGRIPULSE_POSTGRES_PASSWORD="the same password Terraform was given"
export AGRIPULSE_JWT_SECRET="$(openssl rand -hex 16)"
```

The database password has to match the one in the PostgreSQL server, so take it
from wherever you kept it when you ran `terraform apply`.

## 3. Run it

Three values tell the playbook what to deploy and where. The CD workflow passes
them automatically; pass them by hand for a manual deploy:

```sh
ansible-playbook playbook.yml \
  -e agripulse_acr_login_server="$(terraform -chdir=../terraform output -raw acr_login_server)" \
  -e agripulse_database_fqdn="$(terraform -chdir=../terraform output -raw database_fqdn)" \
  -e agripulse_image_tag=<the commit SHA to deploy>
```

| Variable | What it is |
| --- | --- |
| `agripulse_acr_login_server` | Registry to pull from |
| `agripulse_database_fqdn` | Managed PostgreSQL host |
| `agripulse_image_tag` | Which build to run, normally the commit SHA |

Deploying a different build is the same command with a different tag, which is
also how a rollback works.

## 4. Verify

```sh
# The site, through the load balancer
curl -I "$(terraform -chdir=../terraform output -raw app_url)"

# Running it again changes nothing
ansible-playbook playbook.yml -e ... # expect changed=0

# The health signal, on the VM (the API is not public)
ssh -o ProxyCommand="ssh -i ~/.ssh/agripulse_azure -W %h:%p azureuser@$AGRIPULSE_BASTION_IP" \
    -i ~/.ssh/agripulse_azure azureuser@"$AGRIPULSE_VM_IP" \
    'curl -s localhost:3000/health'
# expect {"status":"ok","database":"ok"}

# Container logs, for the demo
ssh ... 'cd /opt/agripulse && sudo docker compose logs --tail 50'
```

## How the registry sign-in works

There is no registry password anywhere. The VM has a system-assigned managed
identity holding the `AcrPull` role. The playbook asks Azure's instance
metadata service for a token for that identity, exchanges it at the registry
for a short-lived docker credential, and logs in with it. Both steps are
`no_log`, so no token reaches the output.

## The database schema

`backend/db/schema.sql` begins with `DROP TABLE`, because it was written for
development and tests. The playbook therefore checks first whether the `prices`
table exists and only creates the schema and loads the sample rows when the
database is empty. An existing production database is never touched.

This is a guard, not a migration system. Changing the schema of a live database
still needs a proper migration step.

## Settings you can change

`group_vars/all.yml` holds the non-secret defaults: the app directory, the
website and API ports, the database name and user, and the SSL mode. The
connection string is built from those, and the app connects with
`sslmode=require` because Azure refuses unencrypted connections.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| SSH times out | Your public IP changed and is no longer in `admin_ssh_cidrs`. Update it in Terraform and apply. |
| `Permission denied (publickey)` on the jump | `ssh -J` does not pass `-i` to the bastion hop. Use `-o ProxyCommand=...` with the key, or `ssh-add` it first. |
| Registry sign-in fails | The VM's identity has lost the `AcrPull` role, or `agripulse_acr_login_server` is wrong. |
| Health check fails | The app started but cannot reach the database. Check the password matches the server and that the private DNS zone is linked. |
| `agripulse_*` is undefined | An empty `group_vars/all/` directory will shadow `group_vars/all.yml`. Remove it. |

## Files

```
ansible.cfg              settings, points at inventory/hosts.yml
playbook.yml             input checks, then the three roles
inventory/hosts.yml      the VM, reached through the bastion
group_vars/all.yml       non-secret defaults and the database URL
roles/docker/            Docker and the Compose plugin
roles/security/          ufw and SSH hardening
roles/app/               registry sign-in, schema, compose, checks
```
