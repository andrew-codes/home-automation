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

variable "ssh_key" {
  type    = string
  default = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDHGX0BrMpr5mm/maYDNJJhBrn1lvjgy+9//ufn+QV5rC8MQpkakTKi3qzEQ22Xw4bOPb59C80TkH8T6ur4Ygb0oPMhFCQoBpd1rabQCIISSwi+I4bth58h8Jl/tXdiNclfTyPHNBPxRTjOGG9Op+Zu8EQtd4QUinf3iFFKJ4Wyk9cuHbKGYkhKnQG/u1LD+IJ6y2pt4Cdh2hnO2HIsSKOp6djx8zuCOMyguN1giFsa4gmd3/TcNO/O/p6G1Xs3v1H9KWWtXVL0gRRd1NTbnbqyuBmlBu2wKWVbznlf7Jjkb0asophnHBSsIcwJU079YGWfCVeZ0eoq/goDcI2Nj+FkNTJsJxuOwCUCBCikPZwUstU1cRAhTP72pu08ZQXM/B+uF2lDCLVu+Kui2bZQbOjNGunRnsFfer7XGpfqIeaYd8zJNFQPQIoE5N+iRMRQ/M1NHY1+E0TtdxWIi3pN11r7d9SLV4XYYdU5OgZFBKeQXULY5tKYG/ZMQj0MPmpksZ8="
}

variable "name" {
  type    = string
  default = "k8s"
  validation {
    condition     = length(var.name) > 0
    error_message = "Name is required."
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

variable "domain" {
  type    = string
  default = "docker.smith-simms.family"
  validation {
    condition     = length(var.domain) > 0
    error_message = "Domain is required."
  }
}

variable "gateway" {
  type = string
  validation {
    condition     = length(var.gateway) > 0
    error_message = "Gateway is required."
  }
}

resource "proxmox_vm_qemu" "k8s-node" {
  count       = 1
  name        = var.name
  target_node = "pve"
  clone       = "ubuntu-server"
  onboot      = true
  cpu         = "host"
  sockets     = "1"
  cores       = 12
  memory      = 65536
  os_type     = "cloud-init"
  scsihw      = "virtio-scsi-pci"
  bootdisk    = "scsi0"
  vmid        = 101

  disk {
    size    = "20G"
    type    = "scsi"
    storage = "local-lvm"
    format  = "ext4"
    ssd     = 1
  }
  disk {
    size    = "350G"
    type    = "scsi"
    storage = "local-lvm"
    format  = "ext4"
    ssd     = 1
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

  nameserver   = var.nameserver
  searchdomain = var.domain
  ipconfig0    = "ip=${var.ip},gw=${var.gateway}"
}
