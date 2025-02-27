terraform {
  required_providers {
    proxmox = {
      source  = "telmate/proxmox"
      version = "2.7.1"
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

variable "ssh_key" {
  type = string
  validation {
    condition     = length(var.ssh_key) > 0
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

resource "proxmox_lxc" "fleet-server" {
  count        = 1
  hostname     = var.hostname
  target_node  = "pve-nuc"
  ostemplate   = "local:vztmpl/debian-11-standard_11.3-1_amd64.tar.zst"
  unprivileged = true
  start        = true
  onboot       = true
  cores        = 2
  memory       = 4096

  rootfs {
    storage = "local-lvm"
    size    = "100G"
  }

  ssh_public_keys = <<-EOT
    ${var.ssh_key}
  EOT

  nameserver = var.nameserver
  network {
    name   = "eth0"
    bridge = "vmbr0"
    ip     = var.ip
    ip6    = "auto"
    gw     = var.gateway
  }
}
