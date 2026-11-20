# AgriPulse VM configuration with Ansible

This folder configures the private app VM that Terraform creates (see
[`../terraform/`](../terraform/README.md)) and deploys the AgriPulse images on it.
In production the CD workflow (`.github/workflows/cd.yml`) runs it for you after
it has built and pushed the images. This page is for running it by hand.

## What the playbook does

| Role | What it does |
| ---- | ------------ |
| `docker` | Waits for the VM's first-boot setup, installs Docker and the Compose plugin, makes sure Docker runs at boot. |
| `security` | Turns on the `ufw` firewall (deny all incoming except SSH and the website port), then hardens SSH: key login only, no passwords, no root login. |
| `app` | Signs in to the container registry (ACR) with the VM's managed identity (no registry password anywhere), writes the `.env` file with your secrets (mode `0600`), creates the database schema only if the database is empty, pulls the API and web images by tag, starts them with Docker Compose and checks that they work. |

No source code is cloned and nothing is built on the VM: it only pulls the
images that CI built. Running the playbook again is safe; a second run with the
same image tag should report `changed=0`.

## How you reach the VM (one route: ProxyJump)

The app VM has no public IP. SSH goes through the bastion with **one** mechanism,
an SSH `ProxyJump` in `~/.ssh/config`. The CD job writes this file itself. For a
manual run, create it once (replace the three values):

```sh
cat >> ~/.ssh/config <<EOF
Host bastion
  HostName <bastion public IP>
  User azureuser
  IdentityFile ~/.ssh/agripulse_azure

Host <app private IP>
  User azureuser
  IdentityFile ~/.ssh/agripulse_azure
  ProxyJump bastion
EOF
ssh bastion true      # must succeed before you run Ansible
```

The inventory does not set a `ProxyCommand` on purpose: a second jump on top of
the `ProxyJump` would break the connection.

## Prerequisites

- Infrastructure from `terraform apply`, and the images already pushed to ACR
  (merge to `main` and let CD do it, or push them yourself).
- Your public IP allowed to SSH to the bastion in Terraform (`admin_ssh_cidr`).
- Ansible 2.16 or newer, with the two collections:

  ```sh
  pipx install --include-deps ansible     # the full package includes the collections
  ansible-galaxy collection install -r requirements.yml   # needed with ansible-core only
  ```

- Work from your Linux home (for example `~/agripulse-crop-price-tracker`), **not**
  from `/mnt/c/...` in WSL: Ansible ignores `ansible.cfg` in world-writable folders.

## 1. Run from the `ansible/` folder

```sh
cd ansible
```

`ansible.cfg` and `inventory/hosts.yml` are found from here. Run from anywhere
else, Ansible finds no inventory and the play for the VM is skipped. The shared
settings (`group_vars/all.yml`) sit next to the playbook and load either way.

## 2. Set the inputs

```sh
export AGRIPULSE_VM_IP="$(terraform -chdir=../terraform output -raw app_private_ip)"
export AGRIPULSE_POSTGRES_PASSWORD="<the secret stored in GitHub>"   # >= 16 chars: letters, digits . - _
export AGRIPULSE_JWT_SECRET="<the secret stored in GitHub>"          # >= 16 chars
# optional: AGRIPULSE_SSH_USER (default azureuser), AGRIPULSE_SSH_KEY (default ~/.ssh/agripulse_azure)

ACR="$(terraform -chdir=../terraform output -raw acr_login_server)"
DB="$(terraform -chdir=../terraform output -raw database_fqdn)"
TAG="<commit SHA of the images in ACR, or latest>"
```

The database password must be the one Terraform gave the PostgreSQL server.

## 3. Check, then run

```sh
ansible-playbook playbook.yml --syntax-check
ansible agripulse -m ansible.builtin.ping          # expect: pong

ansible-playbook playbook.yml \
  -e agripulse_image_tag="$TAG" \
  -e agripulse_acr_login_server="$ACR" \
  -e agripulse_database_fqdn="$DB"
```

Run only one part with tags: `--tags docker`, `--tags security` or `--tags app`.

## 4. Verify

- The play ends with `failed=0`. The playbook itself checks `/health` (which also
  tests the database), the website, `/api/prices` through nginx, that the running
  image is the requested tag, and that the API port is not public.
- Run it again with the same `-e` values: expect `changed=0`.
- Open the app from the load balancer's address (`terraform output app_url`).
- SSH refuses passwords: `ssh -o PubkeyAuthentication=no <app private IP>` gives `Permission denied (publickey)`.

## Settings

Non-secret settings are in [`group_vars/all.yml`](group_vars/all.yml):

| Variable | Default | Meaning |
| -------- | ------- | ------- |
| `agripulse_image_tag` | `latest` | Image tag to deploy (CD passes the commit SHA) |
| `agripulse_acr_login_server` | empty, required | Registry address, from Terraform |
| `agripulse_database_fqdn` | empty, required | Managed PostgreSQL address, from Terraform |
| `agripulse_app_port` | `5173` | Website port. Keep it equal to `app_port` in Terraform |
| `agripulse_ssh_allowed_from` | `any` | Who the VM's own firewall lets connect over SSH |

## Security notes

- **Two firewalls.** The Azure network security group (Terraform) and `ufw` on the VM.
- **Docker bypasses ufw for published ports**, so the compose file binds the API to `127.0.0.1` and the playbook checks that it is not listening publicly.
- **SSH hardening cannot lock you out by accident.** SSH is allowed in `ufw` before it is turned on, passwords are only disabled if the admin user has a key, the config is validated with `sshd -t`, and the service is reloaded, not restarted.
- **No registry password.** The VM's managed identity has only the `AcrPull` role.
- **Secrets** come from your environment (or GitHub secrets in CD), are written to `/opt/agripulse/.env` (root only, `0600`) and are hidden with `no_log`.

## Troubleshooting

| Problem | Likely cause and fix |
| ------- | -------------------- |
| "No inventory was parsed" or "Could not match supplied host pattern" warning | `ansible.cfg` was not found: you are not in `ansible/`, or the folder is world-writable (`/mnt/c` in WSL). `cd ansible` under your Linux home. |
| "group_vars/all.yml was not loaded" | Run with `ansible-playbook` from `ansible/`. (Ad-hoc `ansible` commands do not read group_vars that sit next to the playbook.) |
| `AGRIPULSE_VM_IP is not set` | Run the `export` lines in the same terminal. |
| Stops at "registry and the database were provided" | Pass the three `-e` values from step 3. |
| Stops at the secrets check | `AGRIPULSE_POSTGRES_PASSWORD` or `AGRIPULSE_JWT_SECRET` is missing, too short, or has characters other than letters, digits, `.`, `-`, `_`. |
| Connection times out or `Permission denied (publickey)` | The bastion rule or `~/.ssh/config` is wrong, or the key is not `chmod 600`. Test `ssh bastion true` first. |
| Registry sign-in fails (token request) | The VM has no managed identity or no `AcrPull` role: check the Terraform apply finished. |
| Health check keeps failing | `ssh <app private IP> "cd /opt/agripulse && sudo docker compose logs --tail 50"`. A wrong database password shows here. |

## Files

```
ansible/
├── ansible.cfg              # defaults for this folder
├── requirements.yml         # collections (community.general, community.docker)
├── playbook.yml             # checks inputs, then runs the three roles
├── inventory/hosts.yml      # inventory filled from environment variables
├── group_vars/all.yml       # shared non-secret settings
└── roles/
    ├── docker/              # Docker and the Compose plugin
    ├── security/            # ufw firewall and SSH hardening
    └── app/                 # registry login, .env, compose file, schema, start, checks
```
