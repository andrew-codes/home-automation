terraform {
  required_providers {
    proxmox = {
      source  = "telmate/proxmox"
      version = "2.7.1"
    }
  }
}

provider "proxmox" {
  pm_api_url      = "https://192.168.1.13:8006/api2/json"
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
  default = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDHGX0BrMpr5mm/maYDNJJhBrn1lvjgy+9//ufn+QV5rC8MQpkakTKi3qzEQ22Xw4bOPb59C80TkH8T6ur4Ygb0oPMhFCQoBpd1rabQCIISSwi+I4bth58h8Jl/tXdiNclfTyPHNBPxRTjOGG9Op+Zu8EQtd4QUinf3iFFKJ4Wyk9cuHbKGYkhKnQG/u1LD+IJ6y2pt4Cdh2hnO2HIsSKOp6djx8zuCOMyguN1giFsa4gmd3/TcNO/O/p6G1Xs3v1H9KWWtXVL0gRRd1NTbnbqyuBmlBu2wKWVbznlf7Jjkb0asophnHBSsIcwJU079YGWfCVeZ0eoq/goDcI2Nj+FkNTJsJxuOwCUCBCikPZwUstU1cRAhTP72pu08ZQXM/B+uF2lDCLVu+Kui2bZQbOjNGunRnsFfer7XGpfqIeaYd8zJNFQPQIoE5N+iRMRQ/M1NHY1+E0TtdxWIi3pN11r7d9SLV4XYYdU5OgZFBKeQXULY5tKYG/ZMQj0MPmpksZ8="
}

variable "name" {
  type = string
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

variable "domain" {
  type = string
  validation {
    condition     = length(var.domain) > 0
    error_message = "Domain is required."
  }
}

resource "proxmox_lxc" "vpn" {
  count        = 1
  hostname     = var.name
  target_node  = "pve"
  ostemplate   = "local:vztmpl/ubuntu-20.04-standard_20.04-1_amd64.tar.gz"
  unprivileged = true
  start        = true
  onboot       = true
  startup      = "2,up=30"

  rootfs {
    storage = "local-lvm"
    size    = "20G"
  }

  ssh_public_keys = <<-EOT
    ${var.ssh_key}
  EOT

  nameserver   = var.nameserver
  searchdomain = var.domain
  network {
    name   = "eth0"
    bridge = "vmbr0"
    ip     = var.ip
    ip6    = "auto"
    gw     = var.gateway
  }

  cores  = 2
  memory = 2048
}
