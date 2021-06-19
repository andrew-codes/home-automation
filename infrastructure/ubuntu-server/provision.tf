terraform {
  required_providers {
    proxmox = {
      source  = "telmate/proxmox"
      version = "2.7.1"
    }
  }
}

provider "proxmox" {
  pm_api_url      = "https://192.168.1.3:8006/api2/json"
  pm_user         = "root@pam"
  pm_tls_insecure = true
  pm_log_enable   = true
  pm_log_file     = "terraform-plugin-proxmox.log"
  pm_log_levels = {
    _default    = "debug"
    _capturelog = ""
  }
}

variable "name" {
  type = string
  validation {
    condition     = length(var.name) > 0
    error_message = "Name is required."
  }
}

resource "proxmox_vm_qemu" "ubuntu-server" {
  count       = 1
  name        = var.name
  target_node = "pve"
  iso         = "local:iso/ubuntu-20.04.1-live-server-amd64.iso"
  onboot      = false
  cpu         = "host"
  sockets     = "1"
  cores       = 1
  memory      = 2048
  os_type     = "ubuntu"
  scsihw      = "virtio-scsi-pci"
  bootdisk    = "scsi0"
  vmid        = 104

  disk {
    size    = "20G"
    type    = "scsi"
    storage = "local-lvm"
    format  = "ext4"
    ssd     = 1
  }
  network {
    model  = "virtio"
    bridge = "vmbr0"
  }
}
