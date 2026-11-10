# AgriPulse VM configuration with Ansible

This folder configures the Azure VM that Terraform creates (see
[`../terraform/`](../terraform/README.md)) and deploys the AgriPulse app on it.
One command does everything:

```sh
ansible-playbook playbook.yml
```

## What the playbook does

| Role | What it does |
| ---- | ------------ |
| `docker` | Waits for the VM's first-boot setup to finish, then installs Docker, the Compose plugin and git, and makes sure Docker runs at boot. |
| `security` | Turns on the `ufw` firewall (deny all incoming except SSH and the website port), then hardens SSH: key login only, no passwords, no root login, only the admin user may log in. |
| `app` | Clones this repository on the VM, writes the `.env` file with your secrets (mode `0600`), starts the stack from the repository's own `docker-compose.yml`, and checks that it works. |

Running it again is safe: tasks only change something when the VM is not
already in the wanted state, so a second run should report `changed=0`.

## Prerequisites

- A VM created with Terraform (`terraform apply` in `../terraform/`).
- The SSH **private** key that matches the public key you gave Terraform
  (the examples use `~/.ssh/agripulse_azure`).
- Your computer's public IP must be the one allowed in Terraform
  (`admin_ssh_cidr`), otherwise the connection times out.
- Ansible 2.16 or newer on your computer. On Ubuntu:

  ```sh
  sudo apt update && sudo apt install -y pipx
  pipx install --include-deps ansible
  pipx ensurepath        # then open a new terminal
  ansible --version
  ```

  The `ansible` package already includes the two collections used here. If you
  installed only `ansible-core`, run
  `ansible-galaxy collection install -r requirements.yml`.

## 1. Get the VM address

The address comes from Terraform's outputs. Nothing is typed into a file.

```sh
cd terraform
terraform output -raw vm_public_ip      # prints the VM's public IP
cd ../ansible
```

## 2. Set the inventory and the secrets

The inventory ([`inventory/hosts.yml`](inventory/hosts.yml)) reads everything
from environment variables, so no IP address, key path or password is stored in
Git:

```sh
# Where the VM is, and how to log in
export AGRIPULSE_VM_IP="$(terraform -chdir=../terraform output -raw vm_public_ip)"
export AGRIPULSE_SSH_KEY=~/.ssh/agripulse_azure     # optional, this is the default
export AGRIPULSE_SSH_USER=azureuser                 # optional, this is the default

# Secrets for the app: create your own, never reuse the development defaults
export AGRIPULSE_POSTGRES_PASSWORD="$(openssl rand -hex 16)"
export AGRIPULSE_JWT_SECRET="$(openssl rand -hex 16)"
```

Keep the same terminal for the next steps, or save the two secrets in your
password manager if you need to run the playbook again later in a new terminal.
Use only letters, digits, `.`, `-` and `_` in the secrets (the password is placed
inside a database URL). The playbook stops early if a secret is missing, shorter
than 16 characters, or still a development default.

## 3. Check before running

```sh
ansible-playbook playbook.yml --syntax-check    # the playbook is valid
ansible agripulse -m ansible.builtin.ping       # the VM is reachable over SSH
```

The ping should answer `pong`. The first connection saves the VM's SSH
fingerprint automatically.

## 4. Run the playbook

```sh
ansible-playbook playbook.yml
```

The first run takes a few minutes because the images are built on the VM. At
the end you should see `failed=0`. You can run only one part with tags:

```sh
ansible-playbook playbook.yml --tags docker      # or: security, app
```

## 5. Verify the deployment

Open `http://<vm-public-ip>:5173` in a browser. You should see the prices
table. The playbook itself already checks the API health endpoint, the website,
the `/api/prices` route through nginx, and that the API and database are not
open to the network. You can also check by hand:

```sh
# Run the playbook again: nothing should change
ansible-playbook playbook.yml                    # expect changed=0

# Containers are healthy (from your computer, through SSH)
ssh -i "$AGRIPULSE_SSH_KEY" azureuser@"$AGRIPULSE_VM_IP" \
  "cd /opt/agripulse && sudo docker compose -f docker-compose.yml -f docker-compose.vm.yml ps"

# Firewall is on and only SSH + 5173 are allowed
ssh -i "$AGRIPULSE_SSH_KEY" azureuser@"$AGRIPULSE_VM_IP" "sudo ufw status verbose"

# SSH refuses passwords (expect: Permission denied (publickey))
ssh -o PubkeyAuthentication=no azureuser@"$AGRIPULSE_VM_IP"

# The API and the database are not reachable from the internet (expect a timeout)
curl -m 5 http://"$AGRIPULSE_VM_IP":3000/health
```

## Settings you can change

Non-secret settings live in [`group_vars/all.yml`](group_vars/all.yml):

| Variable | Default | Meaning |
| -------- | ------- | ------- |
| `agripulse_repo_url` | this repository | What the VM clones |
| `agripulse_repo_version` | `main` | Branch or tag to deploy |
| `agripulse_app_port` | `5173` | Website port. Keep it equal to `app_port` in Terraform |
| `agripulse_ssh_allowed_from` | `any` | Who the VM's own firewall lets connect over SSH. Set it to your IP for a second layer on top of the Azure NSG |

To deploy new code, merge it into `main` and run the playbook again.

## Security notes

- **Two firewalls.** The Azure network security group (Terraform) and `ufw` on
  the VM both allow only SSH and the website port.
- **Docker bypasses ufw for published ports.** That is a known Docker behaviour,
  so `docker-compose.yml` alone would publish the API (3000) and database (5433)
  on every interface. The playbook adds `docker-compose.vm.yml`, which binds
  those two ports to `127.0.0.1`, and then checks that they are not listening
  publicly.
- **SSH hardening cannot lock you out by accident.** The playbook allows SSH in
  `ufw` before turning it on, refuses to disable passwords if the admin user has
  no key in `authorized_keys`, validates the config with `sshd -t`, reloads (not
  restarts) the service, and confirms the effective settings with `sshd -T`.
  The settings file is named `00-...` so it wins over the cloud-init defaults.
- **Secrets** are read from your environment, written to `/opt/agripulse/.env`
  (root only, mode `0600`) and hidden from Ansible's output with `no_log`.
  Nothing secret is in this repository.

## Troubleshooting

| Problem | Likely cause and fix |
| ------- | -------------------- |
| Ansible ignores `ansible.cfg` ("world writable directory") | The repository is on a Windows drive (`/mnt/c/...`). Keep it in your Linux home, for example `~/agripulse-crop-price-tracker`. |
| `AGRIPULSE_VM_IP is not set` | Run the `export` lines from step 2 in the same terminal. |
| Connection times out | Your public IP changed or does not match `admin_ssh_cidr`. Update it in Terraform and apply again. |
| `Permission denied (publickey)` | `AGRIPULSE_SSH_KEY` points to the wrong private key, or the key file is readable by others (`chmod 600`). |
| `Could not get lock /var/lib/dpkg/lock` | The VM is still finishing its first boot. Wait a minute and run again (the playbook already waits and retries). |
| Health check keeps failing | See the logs: `ssh ... "cd /opt/agripulse && sudo docker compose logs --tail 50"`. |
| Changed the database password and the API cannot connect | PostgreSQL only reads its password the first time the volume is created. Remove the volume on the VM with `sudo docker compose down -v` in `/opt/agripulse`, then run the playbook again (this deletes the data). |

## Files

```
ansible/
├── ansible.cfg              # defaults for this folder
├── requirements.yml         # collections used (community.general, community.docker)
├── playbook.yml             # checks inputs, then runs the three roles
├── inventory/hosts.yml      # static inventory, filled from environment variables
├── group_vars/all.yml       # shared non-secret settings
└── roles/
    ├── docker/              # Docker, Compose plugin, git
    ├── security/            # ufw firewall and SSH hardening
    └── app/                 # clone, .env, compose override, start, checks
```
