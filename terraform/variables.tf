variable "location" {
  description = "Azure region in which to create the resources."
  type        = string
}

variable "vm_size" {
  description = "Azure VM size. Check availability and cost in the chosen region."
  type        = string
}

variable "admin_ssh_cidr" {
  description = "Public IPv4 CIDR allowed to SSH to the VM (for example, 198.51.100.10/32)."
  type        = string

  validation {
    condition     = can(cidrnetmask(var.admin_ssh_cidr)) && var.admin_ssh_cidr != "0.0.0.0/0"
    error_message = "admin_ssh_cidr must be a valid IPv4 CIDR and must not allow SSH from the entire internet."
  }
}

variable "admin_ssh_public_key" {
  description = "SSH public key installed for the VM administrator. Never provide a private key."
  type        = string

  validation {
    condition     = can(regex("^(ssh-rsa|ssh-ed25519|ecdsa-sha2-nistp[0-9]+) ", trimspace(var.admin_ssh_public_key)))
    error_message = "admin_ssh_public_key must be an OpenSSH RSA, Ed25519, or ECDSA public key."
  }
}

variable "resource_group_name" {
  description = "Name of the resource group that contains all AgriPulse infrastructure."
  type        = string
  default     = "rg-agripulse"
}

variable "admin_username" {
  description = "Linux VM administrator username."
  type        = string
  default     = "azureuser"

  validation {
    condition     = can(regex("^[a-z_][a-z0-9_-]{0,31}$", var.admin_username))
    error_message = "admin_username must be 1-32 lowercase letters, digits, underscores, or hyphens and start with a letter or underscore."
  }
}

variable "app_port" {
  description = "Public TCP port mapped by the Docker Compose frontend."
  type        = number
  default     = 5173

  validation {
    condition     = var.app_port >= 1 && var.app_port <= 65535
    error_message = "app_port must be between 1 and 65535."
  }
}

variable "vnet_address_space" {
  description = "IPv4 address space for the virtual network."
  type        = string
  default     = "10.20.0.0/16"
}

variable "subnet_address_prefix" {
  description = "IPv4 address range for the application subnet."
  type        = string
  default     = "10.20.1.0/24"
}

variable "tags" {
  description = "Tags applied to Azure resources."
  type        = map(string)
  default = {
    application = "agripulse"
    managed_by  = "terraform"
  }
}
