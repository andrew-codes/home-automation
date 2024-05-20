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

- [docker](https://docs.docker.com/get-docker/)
- [vscode](https://code.visualstudio.com/download)
- [remote containers vscode extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

## Running Commands on Dev Machine

All required software to run, develop, and deploy are within a Docker container and leverage the Remote Containers vscode extension. To run commands, start the workspace by typing `Remote-container: Open Folder in Container` from the command palette (Ctrl/Cmd + Shift + P). This will automatically build the container and run yarn to install dependencies.

## Create Secrets .env file

> **Do not commit** `.secrets.env`

```
cp secrets.template.env .secrets.env
```

Fill in Proxmox's password value `PM_PASS=""`.

## Fill in `.provision-vars.env`

Ensure to fill in the values for `.provision-vars.env`.

## Update Proxmox IP

Search fro `pm_api_url` in all `provision.tf` files and update the IP to your Proxmox IP.

```tf
pm_api_url      = "https://{PROXMOX_IP}:8006/api2/json"
```
