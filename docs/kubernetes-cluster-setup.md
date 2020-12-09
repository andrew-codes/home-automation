# Setting up the Kubernetes Cluster

Here is a [list of capabilities](./kubernetes-cluster-features.md) of the cluster once this guide is complete.

## Prerequisite Software

- [node](https://nodejs.org/en/download/)
- [classic yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable)
- [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [docker](https://docs.docker.com/get-docker/)

## Before you Begin

Much of this process is automated, but it still is lengthy and can be time-consuming. As an overview, the process is broken down into these primary steps:

1. Install project dependencies
1. Installing Ubuntu Server on machines that will be in the cluster
1. Assign static IPs to machines
1. Gather the machines' IP addresses for Ansible inventory
1. Generate Secrets
1. Provision nodes via Ansible

## Install Project Dependencies

```bash
yarn
```

## Installing Ubuntu Server

1. Download the ISO file for [ubuntu server@^20.0.0](https://releases.ubuntu.com/20.04.1/ubuntu-20.04.1-live-server-amd64.iso)
   ```bash
   curl https://releases.ubuntu.com/20.04.1/ubuntu-20.04.1-live-server-amd64.iso -o ~/Downloads/ubuntu-server-20.04.iso
   ```
1. Burn the image to a bootable USB drive
   - Plug in a USB drive and determine the path; e.g. `/dev/disk2`
   ```bash
   yarn burn-image /dev/disk2 ~/Downloads/ubuntu-server-20.04.iso
   ```
   > See the [image package](packages/image) for more details
1. Install Ubuntu Server on the physical machine
   - When prompted, provide the following information to the installer
   - Note the user's password, this will be used later
     > Use the same username and password for each machine
1. Repeat for any other machines that will start in your cluster

```yaml
name: hl
host: pick-a-hostname
username: hl
password: hl user password
openSSH: true
import: ssh keys from GitHub
allow_password_ssh_access: false
```

## Preparing Ansible

1. Assign static IP addresses to each node
1. Update `./ansible/hosts.yml` with the IP addresses of your machines
   - Add a machine's IP address to `mains` group for master nodes
   - Add a machine's IP address to `workers` for secondary nodes
   - Add a single primary node's IP address as the `cluster_primary`

### Example

```yaml
all:
  vars:
    ansible_user: hl # user from ubuntu machine setup
  children:
    cluster_primary:
      hosts:
        192.168.1.100: # any primary node; but only one
    mains:
      hosts:
        192.168.1.100: # primary node
    workers:
      hosts:
        192.168.1.110: # worker node
        192.168.1.111: # worker node
```

## Setting Initial Secrets

Create a file, `./secrets.sh`and paste the following, filling in with your values, abd then running: `./set_secrets.sh`:

```bash
#!/usr/bin/env bash

export CLUSTER_IP=""

# Ubuntu server hl user password
export MACHINE_PASSWORD=''

# Your email
export EMAIL=""

# API token to create droplets in Digital Ocean
export DIGITALOCEAN_TOKEN=""
# Digital Ocean Spaces (for backup)
export SPACES_ACCESS_KEY=""
export SPACES_ACCESS_SECRET_KEY=""
export BACKUP_BUCKET=""
export BACKUP_URI=""

# Docker registry domain; e.g. docker.yourdomain.com
export DOCKER_REGISTRY_DOMAIN=""
export DOCKER_REGISTRY_USERNAME=""
export DOCKER_REGISTRY_PASSWORD=""
export DOCKER_REGISTRY_CERT_STATE=""
export DOCKER_REGISTRY_CERT_CITY=""
export DOCKER_REGISTRY_CERT_ORG=""

# Inlets pro license value
export INLETS_PRO_LICENSE=""
export POD_NETWORK_CIDR="192.168.100.0/24"
```

Run the following:

```bash
./set_secrets.sh
```

## Provision Kubernetes

```bash
./ansible.sh ansible/k8s/all.yml
```

## Troubleshooting

If you want to reset the Kubernetes cluster, you can run the following:

> This will not automatically re-install the deployment services.

```bash
./ansible.sh ansible/k8s/reset.yml

# Then re-install deployments.
# ./ansible.sh ansible/k8s/deployments.yml
```
