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

Provisioning the Kubernetes cluster will do the following:

1. Install Kubernetes
1. Install Calico for networking
1. Install helm on main nodes
1. Setup sealed-secrets, dashboard, inlets-pro, and a private docker registry on main nodes

Due to the last item, there are some secrets we need to provide to the provision mechanism. This can be done with the following. The docker registry information will be what the username and password will be.

```shell
mkdir -p ansible/k8s/.secrets
cat > ansible/k8s/.secrets/setup_k8s.yml <<EOL
---
docker_registry_username:
docker_registry_password:
docker_registry_ingress_email:
docker_registry_ingress_domain:

azure_subscription_id:

inlets_pro_license:

pod_network_cidr: "192.168.100.0/24"
EOL
```

##### Running the Provision Script

1. Update `./ansible/hosts` with the IP address of the new Ubuntu Server machine
   - add it to either the `mains` group for main nodes
   - add it to `workers` for secondary nodes
1. Add your password to hl user in Ubuntu Server: `mkdir -p .secrets && echo 'export MACHINE_PASSWORD="{{ your password }}"' > .secrets/install_k8s.vars.sh`
1. Run `./install_k8s.sh`
