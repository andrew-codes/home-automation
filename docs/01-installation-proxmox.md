# Installing Proxmox

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

# Create Ubuntu Server VM on Proxmox

1. Download the ISO file for [ubuntu server@^20.0.0](https://releases.ubuntu.com/20.04.1/ubuntu-20.04.1-live-server-amd64.iso)
   ```bash
   curl https://releases.ubuntu.com/20.04.1/ubuntu-20.04.1-live-server-amd64.iso -o ~/Downloads/ubuntu-server-20.04.iso
   ```
1. Upload the downloaded ISO image to Proxmox
1. When installing Ubuntu Server in a VM, use the following settings at the prompts:

   ```yml
   name: hl
   host: vm-k8s-main
   username: hl
   password: <hl user password>
   openSSH: true
   import: SSH keys from GitHub
   allow_password_ssh_access: false
   ```

1. Add the hl user's password to your `./secrets.sh` file as `MACHINE_PASSWORD`.
1. Add the VM's IP address to your `./secrets.sh` file as `CLUSTER_IP`.

# Next

[Setup Kubernetes](./02-installation-kubernetes) on your HOST.
