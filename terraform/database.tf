# Managed PostgreSQL, reachable only from inside the virtual network.
# In production this replaces the database container from docker-compose.yml.

resource "azurerm_private_dns_zone" "postgres" {
  name                = "${var.name_prefix}-${random_string.suffix.result}.private.postgres.database.azure.com"
  resource_group_name = azurerm_resource_group.app.name

  tags = var.tags
}

resource "azurerm_private_dns_zone_virtual_network_link" "postgres" {
  name                  = "${var.name_prefix}-postgres-dns-link"
  resource_group_name   = azurerm_resource_group.app.name
  private_dns_zone_name = azurerm_private_dns_zone.postgres.name
  virtual_network_id    = azurerm_virtual_network.app.id

  tags = var.tags
}

resource "azurerm_postgresql_flexible_server" "app" {
  name                          = coalesce(var.postgres_server_name, "${var.name_prefix}-db-${random_string.suffix.result}")
  resource_group_name           = azurerm_resource_group.app.name
  location                      = azurerm_resource_group.app.location
  version                       = var.postgres_version
  sku_name                      = var.postgres_sku_name
  storage_mb                    = var.postgres_storage_mb
  backup_retention_days         = var.postgres_backup_retention_days
  administrator_login           = var.postgres_admin_username
  administrator_password        = var.postgres_admin_password
  delegated_subnet_id           = azurerm_subnet.database.id
  private_dns_zone_id           = azurerm_private_dns_zone.postgres.id
  public_network_access_enabled = false
  zone                          = "1"

  tags = var.tags

  depends_on = [azurerm_private_dns_zone_virtual_network_link.postgres]
}

resource "azurerm_postgresql_flexible_server_database" "app" {
  name      = var.postgres_database_name
  server_id = azurerm_postgresql_flexible_server.app.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}
