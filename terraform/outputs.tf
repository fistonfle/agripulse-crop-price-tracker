output "bastion_public_ip" {
  description = "Public IP of the bastion. SSH and Ansible connect through this host."
  value       = azurerm_public_ip.bastion.ip_address
}

output "app_private_ip" {
  description = "Private IP of the application VM. Reachable only from inside the virtual network."
  value       = azurerm_network_interface.app.private_ip_address
}

output "acr_login_server" {
  description = "Container registry host name used by docker login, push, and pull."
  value       = azurerm_container_registry.app.login_server
}

output "database_fqdn" {
  description = "Private host name of the PostgreSQL server."
  value       = azurerm_postgresql_flexible_server.app.fqdn
}

output "app_public_ip" {
  description = "Public IP the load balancer serves the website on."
  value       = azurerm_public_ip.app.ip_address
}

output "app_url" {
  description = "Address to open in a browser."
  value       = "http://${azurerm_public_ip.app.ip_address}:${var.app_port}"
}

output "resource_group_name" {
  description = "Resource group containing the AgriPulse infrastructure."
  value       = azurerm_resource_group.app.name
}

output "admin_username" {
  description = "Linux administrator username on both VMs."
  value       = var.admin_username
}

output "database_name" {
  description = "Name of the application database."
  value       = azurerm_postgresql_flexible_server_database.app.name
}

output "database_admin_username" {
  description = "PostgreSQL administrator username."
  value       = azurerm_postgresql_flexible_server.app.administrator_login
}

output "ssh_to_app_vm" {
  description = "Command that reaches the private application VM through the bastion."
  value       = "ssh -o ProxyCommand=\"ssh -i ~/.ssh/agripulse_azure -W %h:%p ${var.admin_username}@${azurerm_public_ip.bastion.ip_address}\" -i ~/.ssh/agripulse_azure ${var.admin_username}@${azurerm_network_interface.app.private_ip_address}"
}

output "bastion_nsg_name" {
  description = "Name of the bastion security group. The CD workflow opens and closes a temporary SSH rule on it."
  value       = azurerm_network_security_group.bastion.name
}
