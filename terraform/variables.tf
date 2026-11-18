# ---- Required: no defaults, set these per environment ----

variable "location" {
  description = "Azure region in which to create the resources, for example eastus."
  type        = string
}

variable "vm_size" {
  description = "Size of the application VM. Check availability and cost in the chosen region."
  type        = string
}

variable "admin_ssh_public_key" {
  description = "SSH public key installed on the bastion and the application VM. Never provide a private key."
  type        = string

  validation {
    condition     = can(regex("^(ssh-rsa|ssh-ed25519|ecdsa-sha2-nistp[0-9]+) ", trimspace(var.admin_ssh_public_key)))
    error_message = "admin_ssh_public_key must be an OpenSSH RSA, Ed25519, or ECDSA public key."
  }
}

variable "admin_ssh_cidrs" {
  description = "Public IPv4 CIDRs allowed to SSH to the bastion, for example [\"198.51.100.10/32\"]."
  type        = list(string)

  validation {
    condition     = length(var.admin_ssh_cidrs) > 0 && alltrue([for c in var.admin_ssh_cidrs : can(cidrnetmask(c)) && c != "0.0.0.0/0"])
    error_message = "admin_ssh_cidrs must list at least one valid IPv4 CIDR and must not include 0.0.0.0/0."
  }
}

variable "postgres_admin_password" {
  description = "Password for the PostgreSQL administrator. Pass it in at apply time; do not commit it."
  type        = string
  sensitive   = true

  validation {
    condition     = length(var.postgres_admin_password) >= 16
    error_message = "postgres_admin_password must be at least 16 characters."
  }
}

# ---- Naming ----

variable "resource_group_name" {
  description = "Name of the resource group that contains all AgriPulse infrastructure."
  type        = string
  default     = "rg-agripulse"
}

variable "name_prefix" {
  description = "Prefix used for the names of the created resources."
  type        = string
  default     = "agripulse"
}

variable "tags" {
  description = "Tags applied to Azure resources."
  type        = map(string)
  default = {
    application = "agripulse"
    managed_by  = "terraform"
  }
}

# ---- Compute ----

variable "bastion_vm_size" {
  description = "Size of the bastion VM. It only forwards SSH, so a small size is enough."
  type        = string
  default     = "Standard_B1s"
}

variable "admin_username" {
  description = "Linux administrator username on both VMs."
  type        = string
  default     = "azureuser"

  validation {
    condition     = can(regex("^[a-z_][a-z0-9_-]{0,31}$", var.admin_username))
    error_message = "admin_username must be 1-32 lowercase letters, digits, underscores, or hyphens and start with a letter or underscore."
  }
}

# ---- Network ----

variable "app_port" {
  description = "TCP port the website is served on, published by the load balancer."
  type        = number
  default     = 5173

  validation {
    condition     = var.app_port >= 1 && var.app_port <= 65535
    error_message = "app_port must be between 1 and 65535."
  }
}

variable "health_probe_path" {
  description = "HTTP path the load balancer requests to decide whether the VM is healthy."
  type        = string
  default     = "/"
}

variable "vnet_address_space" {
  description = "IPv4 address space for the virtual network."
  type        = string
  default     = "10.20.0.0/16"
}

variable "public_subnet_prefix" {
  description = "IPv4 range for the public subnet that holds the bastion."
  type        = string
  default     = "10.20.1.0/24"
}

variable "private_subnet_prefix" {
  description = "IPv4 range for the private subnet that holds the application VM."
  type        = string
  default     = "10.20.2.0/24"
}

variable "database_subnet_prefix" {
  description = "IPv4 range for the subnet delegated to PostgreSQL Flexible Server."
  type        = string
  default     = "10.20.3.0/24"
}

# ---- Database ----

variable "postgres_server_name" {
  description = "Name of the PostgreSQL server. Leave null to generate a unique name."
  type        = string
  default     = null
}

variable "postgres_version" {
  description = "PostgreSQL major version."
  type        = string
  default     = "16"
}

variable "postgres_sku_name" {
  description = "PostgreSQL Flexible Server SKU, for example B_Standard_B1ms."
  type        = string
  default     = "B_Standard_B1ms"
}

variable "postgres_storage_mb" {
  description = "PostgreSQL storage in MB."
  type        = number
  default     = 32768
}

variable "postgres_backup_retention_days" {
  description = "How many days of automatic backups PostgreSQL keeps."
  type        = number
  default     = 7
}

variable "postgres_admin_username" {
  description = "PostgreSQL administrator username."
  type        = string
  default     = "agripulse"
}

variable "postgres_database_name" {
  description = "Name of the application database created on the server."
  type        = string
  default     = "agripulse"
}

# ---- Container registry ----

variable "acr_name" {
  description = "Name of the container registry (letters and digits only). Leave null to generate a unique name."
  type        = string
  default     = null
}

variable "acr_sku" {
  description = "Container registry SKU: Basic, Standard, or Premium."
  type        = string
  default     = "Basic"

  validation {
    condition     = contains(["Basic", "Standard", "Premium"], var.acr_sku)
    error_message = "acr_sku must be Basic, Standard, or Premium."
  }
}

variable "grant_vm_acr_pull" {
  description = "Give the application VM's identity the AcrPull role. Needs permission to assign roles; set to false if your account cannot."
  type        = bool
  default     = true
}
