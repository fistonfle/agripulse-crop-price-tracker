# Private container registry. CI pushes the images here and the VM pulls them.

resource "azurerm_container_registry" "app" {
  name                = coalesce(var.acr_name, "${var.name_prefix}acr${random_string.suffix.result}")
  resource_group_name = azurerm_resource_group.app.name
  location            = azurerm_resource_group.app.location
  sku                 = var.acr_sku
  admin_enabled       = false

  tags = var.tags
}

# The VM pulls images with its own managed identity instead of a stored password.
resource "azurerm_role_assignment" "vm_acr_pull" {
  count = var.grant_vm_acr_pull ? 1 : 0

  scope                = azurerm_container_registry.app.id
  role_definition_name = "AcrPull"
  principal_id         = azurerm_linux_virtual_machine.app.identity[0].principal_id
}
