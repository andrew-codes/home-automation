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

#### Provision Main for Kubernetes

1. `cd ansible/k8s`
1. Update `./hosts` with the IP address of the new Ubuntu Server machine
   - add it to either the `mains` group
1. `ansible-playbook install_k8s.yml -K`
   - `-K` CLI parameter will prompt you for your `hl` user's password from above
   - you will be prompted for the network CIDR

> Once complete, it will create a file in the `ansible/k8s` directory named `kubernetes_join_command`. This will be used to provision secondary nodes.

##### Provision Secondary Nodes in Kubernetes

> WIP

1. `cd ansible/k8s`
1. Update `./hosts` with the IP address of the new Ubuntu Server machine
   - add it to either the `nodes` group
1. `ansible-playbook install_k8s.yml -K`
   - `-K` CLI parameter will prompt you for your `hl` user's password from above
