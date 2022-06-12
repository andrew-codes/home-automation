terraform {
  required_providers {
    proxmox = {
      source  = "telmate/proxmox"
      version = "2.7.1"
    }
  }
}

provider "proxmox" {
  pm_api_url      = var.pm_api_url
  pm_user         = var.pm_username
  pm_password     = var.pm_password
  pm_tls_insecure = true
  pm_log_enable   = true
  pm_log_file     = "terraform-plugin-proxmox.log"
  pm_log_levels = {
    _default    = "debug"
    _capturelog = ""
  }
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

variable "ssh_key" {
  type = string
  validation {
    condition     = length(var.ssh_key) > 0
    error_message = "Public SSH key is required."
  }
}

variable "hostname" {
  type = string
  validation {
    condition     = length(var.hostname) > 0
    error_message = "Hostname is required."
  }
}

variable "ip" {
  type = string
  validation {
    condition     = length(var.ip) > 0
    error_message = "Ip is required."
  }
}

variable "nameserver" {
  type = string
  validation {
    condition     = length(var.nameserver) > 0
    error_message = "Nameserver is required."
  }
}

variable "gateway" {
  type = string
  validation {
    condition     = length(var.gateway) > 0
    error_message = "Gateway is required."
  }
}

resource "proxmox_vm_qemu" "k8s" {
  count       = 1
  hostname    = var.hostname
  name        = var.hostname
  target_node = "pve"
  clone       = "debian-11-template"
  onboot      = true
  cpu         = "host"
  sockets     = "1"
  cores       = 12
  memory      = 90112
  os_type     = "cloud-init"
  scsihw      = "virtio-scsi-pci"
  bootdisk    = "scsi0"

  disk {
    size         = "1000G"
    type         = "scsi"
    storage      = "local-lvm"
    format       = "ext4"
    ssd          = 1
    storage_type = "lvm"
    iothread     = true
  }

  network {
    model  = "virtio"
    bridge = "vmbr0"
  }
  lifecycle {
    ignore_changes = [
      network,
    ]
  }

  sshkeys = <<-EOT
    ${var.ssh_key}
  EOT

  nameserver = var.nameserver
  ipconfig0  = "ip=${var.ip},gw=${var.gateway}"
}
