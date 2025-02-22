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
  pm_log_enable       = true
  pm_log_file         = "terraform-plugin-proxmox.log"
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

resource "proxmox_vm_qemu" "docker-registry" {
  count       = 1
  name        = var.hostname
  target_node = "pve"
  onboot      = true
  cpu_type    = "host"
  sockets     = "1"
  cores       = 2
  memory      = 4096
  os_type     = "cloud-init"
  scsihw      = "virtio-scsi-pci"

  clone      = "ubuntu-cloud-template"
  full_clone = true

  disks {
    scsi {
      scsi2 {
        disk {
          size       = "140G"
          storage    = "local-lvm"
          emulatessd = true
          format     = "raw"
        }
      }
    }
  }

  network {
    id     = 0
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
