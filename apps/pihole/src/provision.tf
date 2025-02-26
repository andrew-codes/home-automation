terraform {
  required_providers {
    proxmox = {
      source  = "telmate/proxmox"
      version = "3.0.1-rc6"
    }
  }
}

provider "proxmox" {
  pm_api_url          = var.pm_api_url
  pm_api_token_id     = var.pm_username
  pm_api_token_secret = var.pm_password
  pm_tls_insecure     = true
  pm_log_enable       = false
}

variable "pm_api_url" {
  type = string
  validation {
    condition     = length(var.pm_api_url) > 0
    error_message = "Proxmox API URL is required."
  }
}

variable "pm_username" {
  type = string
  validation {
    condition     = length(var.pm_username) > 0
    error_message = "Proxmox username is required."
  }
}

variable "pm_password" {
  type = string
  validation {
    condition     = length(var.pm_password) > 0
    error_message = "Proxmox password is required."
  }
}

variable "hostname" {
  type = string
  validation {
    condition     = length(var.hostname) > 0
    error_message = "Name is required."
  }
}

variable "hostname2" {
  type = string
  validation {
    condition     = length(var.hostname2) > 0
    error_message = "Name is required."
  }
}

variable "sshKey" {
  type = string
  validation {
    condition     = length(var.sshKey) > 0
    error_message = "Public SSH key is required."
  }
}

variable "ip" {
  type = string
  validation {
    condition     = length(var.ip) > 0
    error_message = "Ip is required."
  }
}

variable "ip2" {
  type = string
  validation {
    condition     = length(var.ip2) > 0
    error_message = "Ip is required."
  }
}

variable "gateway" {
  type = string
  validation {
    condition     = length(var.gateway) > 0
    error_message = "Gateway is required."
  }
}

variable "nameserver" {
  type = string
  validation {
    condition     = length(var.nameserver) > 0
    error_message = "Nameserver is required."
  }
}

resource "proxmox_lxc" "pihole1" {
  vmid         = 230
  count        = 1
  hostname     = var.hostname
  target_node  = "pve"
  ostemplate   = "nas-iso:vztmpl/ubuntu-24.04-standard_24.04-2_amd64.tar.zst"
  unprivileged = true
  start        = false
  onboot       = true
  startup      = "1"
  cores        = 3
  memory       = 4096
  swap         = 1024
  nameserver   = var.nameserver

  rootfs {
    storage = "local-lvm"
    size    = "10G"
  }

  ssh_public_keys = <<-EOT
    ${var.sshKey}
  EOT

  network {
    name     = "eth0"
    bridge   = "vmbr0"
    ip       = var.ip
    ip6      = "auto"
    gw       = var.gateway
    firewall = false
  }
}
resource "proxmox_lxc" "pihole2" {
  vmid         = 231
  count        = 1
  hostname     = var.hostname2
  target_node  = "pve"
  ostemplate   = "nas-iso:vztmpl/ubuntu-24.04-standard_24.04-2_amd64.tar.zst"
  unprivileged = true
  start        = false
  onboot       = true
  startup      = "1"
  cores        = 3
  memory       = 4096
  swap         = 1024
  nameserver   = var.nameserver

  rootfs {
    storage = "local-lvm"
    size    = "10G"
  }

  ssh_public_keys = <<-EOT
    ${var.sshKey}
  EOT

  network {
    name     = "eth0"
    bridge   = "vmbr0"
    ip       = var.ip2
    ip6      = "auto"
    gw       = var.gateway
    firewall = false
  }
}

