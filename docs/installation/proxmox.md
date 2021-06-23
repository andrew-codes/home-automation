# Install Proxmox

The goal is to install the Kubernetes cluster on an Ubuntu Server VM. Although we could install the cluster on an Ubuntu server directly running on the physical machine, running the cluster in a VM enables backup/restores. In doing so, we will be able to backup/restore the entire VM, including the cluster, containers, and the container's drives.

## Required Secrets

Add your DEV machine's root password as a secret; e.g., `export DEV_MACHINE_PASSWORD="your dev machine password"`. The `DEV_MACHINE_PASSWORD` is required for formatting USB drives and running applications locally via Telepresence.

## Burn Proxmox Installation USB

1. Download the ISO file for [Proxmox@6.3](https://www.proxmox.com/en/downloads?task=callelement&format=raw&item_id=551&element=f85c494b-2b32-4109-b8c1-083cca2b7db6&method=download&args[0]=fddb74cadac96ec12df291d95068f984)
   ```bash
   curl https://www.proxmox.com/en/downloads?task=callelement&format=raw&item_id=551&element=f85c494b-2b32-4109-b8c1-083cca2b7db6&method=download&args[0]=fddb74cadac96ec12df291d95068f984 -o ~/Downloads/proxmox-ve-6.3.iso
   ```
1. Burn the image to a bootable USB drive

   - Insert a USB drive and determine the path; e.g. `/dev/disk2`

   ```bash
   yarn burn-image /dev/disk2 ~/Downloads/proxmox-ve-6.3.iso
   ```

   > See the [image package](packages/image) for more details

1. Install Proxmox on the HYPERVISOR (physical machine)

## Updating SSH Keys

Before we can continue and provision machines, we need to update our provision scripts with your SSH public key. Search for the following in this project: `default = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDHGX0BrMpr5mm/maYDNJJhBrn1lvjgy+9//ufn+QV5rC8MQpkakTKi3qzEQ22Xw4bOPb59C80TkH8T6ur4Ygb0oPMhFCQoBpd1rabQCIISSwi+I4bth58h8Jl/tXdiNclfTyPHNBPxRTjOGG9Op+Zu8EQtd4QUinf3iFFKJ4Wyk9cuHbKGYkhKnQG/u1LD+IJ6y2pt4Cdh2hnO2HIsSKOp6djx8zuCOMyguN1giFsa4gmd3/TcNO/O/p6G1Xs3v1H9KWWtXVL0gRRd1NTbnbqyuBmlBu2wKWVbznlf7Jjkb0asophnHBSsIcwJU079YGWfCVeZ0eoq/goDcI2Nj+FkNTJsJxuOwCUCBCikPZwUstU1cRAhTP72pu08ZQXM/B+uF2lDCLVu+Kui2bZQbOjNGunRnsFfer7XGpfqIeaYd8zJNFQPQIoE5N+iRMRQ/M1NHY1+E0TtdxWIi3pN11r7d9SLV4XYYdU5OgZFBKeQXULY5tKYG/ZMQj0MPmpksZ8="`. Replace all of these found references with `default = $YOUR_PUBLIC_SSH_KEY`.
