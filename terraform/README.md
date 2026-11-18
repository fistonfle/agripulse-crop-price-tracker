# AgriPulse Azure infrastructure

Terraform describes the production topology: a private network with a bastion,
an application VM that has no public IP, a managed PostgreSQL server, and a
private container registry.

```
                 internet
                    |
      SSH (your IP) |  HTTP :5173
                    |      |
            +-------+      +-------------+
            |                            |
     +--------------+            +-----------------+
     |   bastion    |            |  load balancer  |
     | public subnet|            |   public IP     |
     |  10.20.1.0/24|            +--------+--------+
     +------+-------+                     |
            |  SSH only from the bastion  |
            +--------------+--------------+
                           |
                  +--------v---------+        +----------------------+
                  |  application VM  |------->| container registry   |
                  |  private subnet  | pull   | (private, no admin   |
                  |  10.20.2.0/24    |        |  user)               |
                  |  no public IP    |        +----------------------+
                  +--------+---------+
                           | PostgreSQL :5432
                  +--------v-----------------+
                  | PostgreSQL Flexible Srv  |
                  | database subnet          |
                  | 10.20.3.0/24, private    |
                  +--------------------------+
```

## What each file holds

| File | Contents |
| --- | --- |
| `main.tf` | Provider versions, the resource group, the random suffix used for globally unique names |
| `network.tf` | Virtual network, the three subnets, both network security groups and their rules, the public load balancer |
| `compute.tf` | The bastion VM and the private application VM with their network interfaces |
| `database.tf` | PostgreSQL Flexible Server, its database, and the private DNS zone |
| `registry.tf` | Azure Container Registry and the VM's pull permission |
| `variables.tf` | Every input, with defaults where a default is safe |
| `outputs.tf` | The values Ansible and the CD workflow need |
| `cloud-init.yaml.tftpl` | First-boot script that installs Docker on the application VM |

## How the network is closed off

- The application VM has no public IP. Public web traffic arrives on the load
  balancer's public IP and is forwarded to the VM on the application port.
- The load balancer's outbound rule is what gives the private subnet outbound
  internet access, so the VM can install packages and pull images without being
  reachable from the internet itself.
- The bastion security group allows TCP 22 only from the CIDRs in
  `admin_ssh_cidrs`. `0.0.0.0/0` is rejected by a variable validation.
- The application security group allows the web port from the internet, the
  load balancer's health probe, and TCP 22 only from the public subnet, which is
  the bastion. Everything else is denied by Azure's default rules.
- PostgreSQL has `public_network_access_enabled = false` and lives in a
  delegated subnet, so it is only resolvable and reachable inside the network.
- The registry has `admin_enabled = false`. The VM pulls with its own managed
  identity (`AcrPull`), so no registry password is stored anywhere.

## Prerequisites

- Terraform 1.5 or later
- Azure CLI, signed in with `az login`
- A subscription with permission to create the resources above
- An SSH key pair; only the public key is given to Terraform

Select the intended subscription first:

```sh
az account show
export ARM_SUBSCRIPTION_ID="$(az account show --query id -o tsv)"
```

The provider authenticates through the Azure CLI session. No client secret is
stored in these files.

## Set the variables

Create a key pair if you do not have one:

```sh
ssh-keygen -t ed25519 -f ~/.ssh/agripulse_azure
```

Copy the example file and fill it in. `terraform.tfvars` is git-ignored:

```sh
cp terraform.tfvars.example terraform.tfvars
```

Five inputs have no default and must be set:

| Variable | What to put in it |
| --- | --- |
| `location` | Azure region available to your subscription, for example `eastus` |
| `vm_size` | Application VM size within your quota, for example `Standard_B2s` |
| `admin_ssh_cidrs` | Your own public IPv4 as a list, for example `["203.0.113.10/32"]` |
| `admin_ssh_public_key` | The contents of `~/.ssh/agripulse_azure.pub` |
| `postgres_admin_password` | At least 16 characters; generate with `openssl rand -hex 16` |

Keeping the database password out of the file is better. Pass it through the
environment instead:

```sh
export TF_VAR_postgres_admin_password="$(openssl rand -hex 16)"
```

Everything else has a default in `variables.tf`: the address ranges, the
PostgreSQL SKU and version, the registry SKU, the application port, the
bastion size, and the resource names.

If your account cannot assign Azure roles, set `grant_vm_acr_pull = false` and
ask an owner to grant `AcrPull` on the registry to the VM's identity.

## Initialize, review, apply

```sh
terraform init
terraform fmt -check
terraform validate
terraform plan
```

`terraform plan` is read-only and creates nothing. Read it and confirm the
subscription, region, sizes and open ports before applying. A first plan on an
empty state adds 32 resources.

```sh
terraform apply
```

Terraform shows the plan again and asks for confirmation. Do not approve it
unless the resources and the cost are acceptable.

## Outputs

```sh
terraform output
terraform output -raw bastion_public_ip
terraform output -raw acr_login_server
```

| Output | Used by |
| --- | --- |
| `bastion_public_ip` | SSH and the Ansible jump host |
| `app_private_ip` | The Ansible inventory host |
| `acr_login_server` | `docker login` / `docker push` in CI, and the VM's pull |
| `database_fqdn` | The application's `DATABASE_URL` |
| `app_public_ip`, `app_url` | The live address of the website |
| `ssh_to_app_vm` | A ready-made SSH command through the bastion |

## Reaching the application VM

The VM is private, so SSH goes through the bastion with `-J` (ProxyJump):

```sh
ssh -J azureuser@$(terraform output -raw bastion_public_ip) \
    azureuser@$(terraform output -raw app_private_ip)
```

Or copy the command straight from the output:

```sh
terraform output -raw ssh_to_app_vm
```

Ansible uses the same path. Point it at the private IP and set the jump host in
`ansible_ssh_common_args`:

```sh
export AGRIPULSE_VM_IP="$(terraform output -raw app_private_ip)"
export AGRIPULSE_BASTION_IP="$(terraform output -raw bastion_public_ip)"
```

## Cleanup

```sh
terraform destroy
```

Review the destroy plan before confirming. State tracks the resource IDs and
must be kept between runs; local state, plans and `*.tfvars` are git-ignored.
Never commit state.

## Cost

Applying this charges for two VMs and their disks, two Standard public IPs, the
Standard load balancer, and the PostgreSQL Flexible Server with its storage and
backups. That is more than the single VM of the earlier formative. Prices vary
by region, subscription and date, and a successful plan is not an estimate.
Check the Azure Pricing Calculator and your Azure for Students credit before
applying, and run `terraform destroy` when the demo is finished. A VM stopped
from inside the OS still bills compute; deallocate it in Azure or destroy it.
