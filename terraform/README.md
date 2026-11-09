# AgriPulse Azure infrastructure

This Terraform configuration creates one resource group, virtual network and
subnet, network security group and rules, one static public IP, and one Linux
VM with a standard managed OS disk. The Ubuntu VM installs Docker Engine and
Docker Compose at first boot so it can run the repository's `docker-compose.yml`.

The only inbound rules are SSH (restricted to the configured administrator
CIDR) and the application frontend port (5173 by default). PostgreSQL and the
backend API are not opened directly to the internet.

## Prerequisites

- Terraform 1.5 or later
- Azure CLI, signed in with `az login`
- An Azure subscription with permission to create the listed resources
- An SSH key pair; only its public key is passed to Terraform

Check or select the intended subscription before proceeding:

```sh
az account show
az account set --subscription <subscription-id>
export ARM_SUBSCRIPTION_ID="$(az account show --query id -o tsv)"
```

The AzureRM provider authenticates using the Azure CLI session. The subscription
ID is read from `ARM_SUBSCRIPTION_ID`; no client secret or credential is stored
in these files.

## Configure variables

Create a public key if you do not already have one:

```sh
ssh-keygen -t ed25519 -f ~/.ssh/agripulse_azure
```

Create `terraform.tfvars` in this directory (it is git-ignored) and set the
required environment-specific values:

```hcl
location            = "Azure region, for example eastus"
vm_size             = "Azure VM size available to your subscription"
admin_ssh_cidr       = "your-public-ipv4/32"
admin_ssh_public_key = "contents of ~/.ssh/agripulse_azure.pub"
```

Replace the example descriptions with actual values. Obtain the public IP CIDR
of the machine that will run Ansible/SSH; do not use `0.0.0.0/0`. Use an Azure
region and VM size that are available under your subscription's quota and review
their prices before creating resources. Optional variables such as
`resource_group_name`, `admin_username`, `app_port`, and network ranges have
documented defaults in `variables.tf`.

Alternatively, pass sensitive-to-your-environment inputs through a local
untracked tfvars file or CLI variables. Do not put keys or other private
credentials in source control. The SSH public key is not secret, but the
configuration file containing it is ignored to keep local settings out of Git.

## Initialize, review, and apply

From this directory:

```sh
terraform init
terraform fmt -check
terraform validate
terraform plan
```

Read the plan and confirm the selected subscription, region, VM size, inbound
ports, and resource count before applying. `terraform plan` is read-only and
does not create Azure resources. To create the infrastructure only after
reviewing the plan:

```sh
terraform apply
```

Terraform will show the plan again and ask for confirmation. Do not approve it
unless the resources and costs are acceptable.

## Outputs and running the app

After apply, retrieve the IDs and Ansible connection details with:

```sh
terraform output
terraform output -raw vm_public_ip
```

Connect using the matching private key, then clone the application and start
the Compose stack:

```sh
ssh -i ~/.ssh/agripulse_azure azureuser@<vm-public-ip>
git clone https://github.com/fistonfle/agripulse-crop-price-tracker.git
cd agripulse-crop-price-tracker
cp .env.example .env
chmod 600 .env
```

Edit `.env` and replace the development defaults for `POSTGRES_PASSWORD` and
`JWT_SECRET` with strong, unique values. Do not expose or commit this file.
Then start the stack:

```sh
sudo docker-compose up -d --build
```

Open `http://<vm-public-ip>:5173`. The VM public IP and its frontend port are
intended for Ansible inventory and application access. The VM administrator can
run Docker without `sudo` after reconnecting to SSH for the updated group
membership to take effect.

## Cleanup

Destroy the resources when they are no longer needed:

```sh
terraform destroy
```

Review the destroy plan and confirm before proceeding. Terraform state tracks
resource IDs and must be retained securely between operations; this directory's
local state, plans, and variable files are git-ignored. Back up state securely
if needed, and never commit it.

## Azure costs

Applying this configuration can incur charges, primarily for the running Linux
VM, its managed OS disk, and the Standard static public IP. The VM can continue
to incur compute charges while stopped from inside the OS; deallocate it in
Azure when not in use, or destroy the deployment. Prices vary by region,
subscription, VM size, and date. Check the Azure Pricing Calculator and your
Azure for Students remaining credit/quota before applying. A successful plan
does not reserve capacity or estimate the final bill. Since `location` and
`vm_size` are required inputs, there is no fixed estimate in this configuration;
calculate the selected VM's running hours, disk, public IP, and bandwidth for
your region before applying.
