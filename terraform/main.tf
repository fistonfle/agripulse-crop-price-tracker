terraform {
  required_version = ">= 1.5.0"

  # State and run history live in HCP Terraform, so the team and CI share one
  # state instead of a file on someone's laptop. Runs still execute locally
  # against the Azure CLI session.
  cloud {
    organization = "alu-devops-fiston"

    workspaces {
      name = "agripulse-prod"
    }
  }

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }
}

provider "azurerm" {
  features {}
}

# The registry and the database server need globally unique names.
resource "random_string" "suffix" {
  length  = 6
  lower   = true
  numeric = true
  upper   = false
  special = false
}

resource "azurerm_resource_group" "app" {
  name     = var.resource_group_name
  location = var.location

  tags = var.tags
}
