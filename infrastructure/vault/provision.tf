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
  default = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDHGX0BrMpr5mm/maYDNJJhBrn1lvjgy+9//ufn+QV5rC8MQpkakTKi3qzEQ22Xw4bOPb59C80TkH8T6ur4Ygb0oPMhFCQoBpd1rabQCIISSwi+I4bth58h8Jl/tXdiNclfTyPHNBPxRTjOGG9Op+Zu8EQtd4QUinf3iFFKJ4Wyk9cuHbKGYkhKnQG/u1LD+IJ6y2pt4Cdh2hnO2HIsSKOp6djx8zuCOMyguN1giFsa4gmd3/TcNO/O/p6G1Xs3v1H9KWWtXVL0gRRd1NTbnbqyuBmlBu2wKWVbznlf7Jjkb0asophnHBSsIcwJU079YGWfCVeZ0eoq/goDcI2Nj+FkNTJsJxuOwCUCBCikPZwUstU1cRAhTP72pu08ZQXM/B+uF2lDCLVu+Kui2bZQbOjNGunRnsFfer7XGpfqIeaYd8zJNFQPQIoE5N+iRMRQ/M1NHY1+E0TtdxWIi3pN11r7d9SLV4XYYdU5OgZFBKeQXULY5tKYG/ZMQj0MPmpksZ8="
}

resource "proxmox_lxc" "vault" {
  count        = 1
  hostname     = "vault"
  target_node  = "pve"
  ostemplate   = "local:vztmpl/debian-10-standard_10.7-1_amd64.tar.gz"
  unprivileged = false
  start        = true
  onboot       = true
  startup      = "2,up=30"
  vmid        = 105

  rootfs {
    storage = "local-lvm"
    size    = "40G"
  }

  ssh_public_keys = <<-EOT
    ${var.ssh_key}
  EOT

  nameserver = "192.168.3.1"

  network {
    name   = "eth0"
    bridge = "vmbr0"
    ip     = "192.168.3.3/24"
    ip6    = "auto"
    gw     = "192.168.1.0"
  }

  cores  = 2
  memory = 2048
}
