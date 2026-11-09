output "resource_group_name" {
  description = "Resource group containing the AgriPulse infrastructure."
  value       = azurerm_resource_group.app.name
}

output "virtual_network_id" {
  description = "ID of the virtual network."
  value       = azurerm_virtual_network.app.id
}

output "subnet_id" {
  description = "ID of the application subnet."
  value       = azurerm_subnet.app.id
}

output "network_security_group_id" {
  description = "ID of the network security group."
  value       = azurerm_network_security_group.app.id
}

output "network_interface_id" {
  description = "ID of the VM network interface."
  value       = azurerm_network_interface.app.id
}

output "vm_id" {
  description = "ID of the Linux virtual machine."
  value       = azurerm_linux_virtual_machine.app.id
}

output "vm_public_ip" {
  description = "Public IP address to use as the Ansible inventory host."
  value       = azurerm_public_ip.app.ip_address
}

output "vm_admin_username" {
  description = "Linux VM administrator username."
  value       = azurerm_linux_virtual_machine.app.admin_username
}
