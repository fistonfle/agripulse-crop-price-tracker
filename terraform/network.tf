# One virtual network with three subnets:
#   public   - the bastion, the only machine reachable from the internet by SSH
#   private  - the application VM, no public IP
#   database - delegated to PostgreSQL Flexible Server

resource "azurerm_virtual_network" "app" {
  name                = "${var.name_prefix}-vnet"
  address_space       = [var.vnet_address_space]
  location            = azurerm_resource_group.app.location
  resource_group_name = azurerm_resource_group.app.name

  tags = var.tags
}

resource "azurerm_subnet" "public" {
  name                 = "${var.name_prefix}-public-subnet"
  resource_group_name  = azurerm_resource_group.app.name
  virtual_network_name = azurerm_virtual_network.app.name
  address_prefixes     = [var.public_subnet_prefix]
}

resource "azurerm_subnet" "private" {
  name                 = "${var.name_prefix}-private-subnet"
  resource_group_name  = azurerm_resource_group.app.name
  virtual_network_name = azurerm_virtual_network.app.name
  address_prefixes     = [var.private_subnet_prefix]
}

resource "azurerm_subnet" "database" {
  name                 = "${var.name_prefix}-database-subnet"
  resource_group_name  = azurerm_resource_group.app.name
  virtual_network_name = azurerm_virtual_network.app.name
  address_prefixes     = [var.database_subnet_prefix]
  service_endpoints    = ["Microsoft.Storage"]

  delegation {
    name = "postgresql"

    service_delegation {
      name    = "Microsoft.DBforPostgreSQL/flexibleServers"
      actions = ["Microsoft.Network/virtualNetworks/subnets/join/action"]
    }
  }
}

resource "azurerm_network_security_group" "database" {
  name                = "${var.name_prefix}-database-nsg"
  location            = azurerm_resource_group.app.location
  resource_group_name = azurerm_resource_group.app.name

  tags = var.tags
}

resource "azurerm_subnet_network_security_group_association" "database" {
  subnet_id                 = azurerm_subnet.database.id
  network_security_group_id = azurerm_network_security_group.database.id
}

# ---- Bastion security group: SSH from our own addresses only ----

resource "azurerm_network_security_group" "bastion" {
  name                = "${var.name_prefix}-bastion-nsg"
  location            = azurerm_resource_group.app.location
  resource_group_name = azurerm_resource_group.app.name

  tags = var.tags
}

resource "azurerm_network_security_rule" "bastion_ssh" {
  name                        = "Allow-SSH-From-Admins"
  priority                    = 100
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "22"
  source_address_prefixes     = var.admin_ssh_cidrs
  destination_address_prefix  = var.public_subnet_prefix
  resource_group_name         = azurerm_resource_group.app.name
  network_security_group_name = azurerm_network_security_group.bastion.name
}

resource "azurerm_subnet_network_security_group_association" "public" {
  subnet_id                 = azurerm_subnet.public.id
  network_security_group_id = azurerm_network_security_group.bastion.id
}

# ---- Application security group: web from anywhere, SSH from the bastion ----

resource "azurerm_network_security_group" "app" {
  name                = "${var.name_prefix}-app-nsg"
  location            = azurerm_resource_group.app.location
  resource_group_name = azurerm_resource_group.app.name

  tags = var.tags
}

resource "azurerm_network_security_rule" "app_web" {
  name                        = "Allow-Web"
  priority                    = 100
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = tostring(var.app_port)
  source_address_prefix       = "Internet"
  destination_address_prefix  = var.private_subnet_prefix
  resource_group_name         = azurerm_resource_group.app.name
  network_security_group_name = azurerm_network_security_group.app.name
}

# The load balancer health probe comes from this Azure-owned address.
resource "azurerm_network_security_rule" "app_probe" {
  name                        = "Allow-LoadBalancer-Probe"
  priority                    = 110
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = tostring(var.app_port)
  source_address_prefix       = "AzureLoadBalancer"
  destination_address_prefix  = var.private_subnet_prefix
  resource_group_name         = azurerm_resource_group.app.name
  network_security_group_name = azurerm_network_security_group.app.name
}

resource "azurerm_network_security_rule" "app_ssh_from_bastion" {
  name                        = "Allow-SSH-From-Bastion"
  priority                    = 120
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "22"
  source_address_prefix       = var.public_subnet_prefix
  destination_address_prefix  = var.private_subnet_prefix
  resource_group_name         = azurerm_resource_group.app.name
  network_security_group_name = azurerm_network_security_group.app.name
}

resource "azurerm_subnet_network_security_group_association" "private" {
  subnet_id                 = azurerm_subnet.private.id
  network_security_group_id = azurerm_network_security_group.app.id
}

# ---- Public entry point for the website ----
#
# The application VM has no public IP. A public load balancer forwards the
# application port to it, and its outbound rule gives the private subnet
# outbound internet access for package and image pulls.

resource "azurerm_public_ip" "app" {
  name                = "${var.name_prefix}-app-pip"
  location            = azurerm_resource_group.app.location
  resource_group_name = azurerm_resource_group.app.name
  allocation_method   = "Static"
  sku                 = "Standard"

  tags = var.tags
}

resource "azurerm_lb" "app" {
  name                = "${var.name_prefix}-lb"
  location            = azurerm_resource_group.app.location
  resource_group_name = azurerm_resource_group.app.name
  sku                 = "Standard"

  frontend_ip_configuration {
    name                 = "public"
    public_ip_address_id = azurerm_public_ip.app.id
  }

  tags = var.tags
}

resource "azurerm_lb_backend_address_pool" "app" {
  name            = "${var.name_prefix}-backend-pool"
  loadbalancer_id = azurerm_lb.app.id
}

resource "azurerm_lb_probe" "app" {
  name                = "${var.name_prefix}-health-probe"
  loadbalancer_id     = azurerm_lb.app.id
  protocol            = "Http"
  port                = var.app_port
  request_path        = var.health_probe_path
  interval_in_seconds = 5
  number_of_probes    = 2
}

resource "azurerm_lb_rule" "app" {
  name                           = "${var.name_prefix}-web-rule"
  loadbalancer_id                = azurerm_lb.app.id
  protocol                       = "Tcp"
  frontend_port                  = var.app_port
  backend_port                   = var.app_port
  frontend_ip_configuration_name = "public"
  backend_address_pool_ids       = [azurerm_lb_backend_address_pool.app.id]
  probe_id                       = azurerm_lb_probe.app.id
  disable_outbound_snat          = true
}

resource "azurerm_lb_outbound_rule" "app" {
  name                    = "${var.name_prefix}-outbound-rule"
  loadbalancer_id         = azurerm_lb.app.id
  protocol                = "All"
  backend_address_pool_id = azurerm_lb_backend_address_pool.app.id

  frontend_ip_configuration {
    name = "public"
  }
}
