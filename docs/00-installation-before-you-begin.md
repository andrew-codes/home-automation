# Before you Begin

## Terminology

Through the guide, there are three different target machines that will be mentioned:

| Machine    | Description                                             |
| :--------- | :------------------------------------------------------ |
| DEV        | Development machine; not running the Kubernetes cluster |
| HYPERVISOR | Machine running Proxmox; runs HOST in a virtual machine |
| HOST       | Machine running the Kubernetes cluster                  |
| CONTAINER  | Docker container running within the Kubernetes cluster  |

## Prerequisite Software

Ensure the following is installed on your DEV machine.

- [node](https://nodejs.org/en/download/)
- [classic yarn](https://classic.yarnpkg.com/en/docs/install/#mac-stable)
- [Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [docker](https://docs.docker.com/get-docker/)
- [yq](https://mikefarah.github.io/yq/)
- [telepresence](https://www.telepresence.io/reference/install)

## Install Dependencies

On your DEV machine, clone the repo and run:

```bash
yarn
```

## Create Blank Secrets File

> **Do not commit** `secrets.sh`

```
cp secrets.template.sh secrets.sh
```

# Next

[Install Proxmox](./01-installation-proxmox.md) on your HYPERVISOR.
