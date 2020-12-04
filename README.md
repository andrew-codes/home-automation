# My Home Automation

This mono-repo consists of several applications and services I use to create my home automation.

## Prerequisite Software

- [node](https://nodejs.org/en/download/)
- [classic yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable)
- [ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)

## Setup

```shell
yarn # to install dependencies
```

### Provisioning Kubernetes Nodes

Follow these steps to install and provision nodes (physical machines) in a local Kubernetes cluster.

#### Install Ubuntu Server

1. Download [ubuntu server@^20.0.0](https://releases.ubuntu.com/20.04.1/ubuntu-20.04.1-live-server-amd64.iso) ISO file
1. Burn the image to a bootable USB drive
   - Plug in a USB drive and determine the path; e.g. `/dev/disk2`
   - Run `yarn burn-image /dev/disk2 ~/Downloads/ubuntu-server.iso` to burn the image to the drive
   - See the [image package README](packages/image) for more details
1. Install Ubuntu Server on the physical machine
   - When prompted, provide the following information to the installer

```yaml
name: hl
host: pick a hostname
username: hl
password: pick a password
openSSH: true
import: ssh keys from GitHub
allow_password_ssh_access: false
```

> Note the password, this will be used later.

#### Provision Kubernetes

##### Setup Kubernetes Secrets

```shell
# Ubuntu server hl user password
export MACHINE_PASSWORD=""

# API token to create droplets in Digital Ocean
export DIGITALOCEAN_TOKEN=""

# These will be the credentials you set the private docker registry
export DOCKER_REGISTRY_USERNAME =""
export DOCKER_REGISTRY_PASSWORD=""
# Your email
export DOCKER_REGISTRY_INGRESS_EMAIL=""
# Docker registry domain; e.g. docker.yourdomain.com
export DOCKER_REGISTRY_INGRESS_DOMAIN=""

# Inlets pro license value
export INLETS_PRO_LICENSE=""
export POD_NETWORK_CIDR="192.168.100.0/24"

./k8s_set_secrets.sh
```

##### Running the Provision Script

1. Update `./ansible/hosts` with the IP address of the new Ubuntu Server machine
   - add it to either the `mains` group for main nodes
   - add it to `workers` for secondary nodes
1. Run `./k8s_install.sh`
