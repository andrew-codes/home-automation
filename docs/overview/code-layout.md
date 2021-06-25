# Code and Repo Structure

Applications are narrowly focused micro-services working with other micro-services deployed a Kubernetes cluster on provisoned infrastructure.

## Repo Areas of Concern

The mono-repo consists of a few key areas:

| Directory        | Are packages? | Purpose/Description                                                                                                |
| :--------------- | :-----------: | :----------------------------------------------------------------------------------------------------------------- |
| `infrastructure` |      Yes      | Represents infrastructure (VMs, LXC containers) that can be provisioned on a Hypervisor (Proxmox).                 |
| `apps`           |      Yes      | Source code for application and/or services.                                                                       |
| `deployments`    |      Yes      | Packages up one or more `apps` to be deployed (either via Kubernetes or directly on a provisioned infrastructure). |
| `packages`       |      Yes      | Re-useable, private node packages that are consumed by `apps` or CLI scripts.                                      |
| `scripts`        |      No       | Executable scripts used either as `yarn scripts` or directly.                                                      |
| `patches`        |      No       | Git diffs to apply as patches to specific node_module packages.                                                    |

## Running Repo Tasks

Certain dependencies are required to run the repo's tasks. For example, node and yarn are required; among others. In order to prevent the need to install all of these depedencies locally, a [dev container](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) is provided with the repo. See [before you begin](./installation/before-you-begin.md) for more details on required software to run locally.

All actionable tasks can and should be done from the root of the repo. These tasks are invoked via `yarn scripts`. See the root `package.json` for a complete list of available repo tasks.

> Most yarn scripts can accept multiple `--scope @ha/package_name` parameters to run the given task only in the context of specific packages.

## Common Tasks

### Infrastructure

> These tasks do no accept a `--scope` parameter.

| Task             | Purpose/Description                                                                                                                                  |
| :--------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn provision` | Provision a VM/LXC on Proxmox. Instance details are defined in an `.env` file that is provided to the script; .e.g., `yarn provision vault prod.env` |

### Apps

> These tasks do accept a `--scope` parameter.

| Task              | Purpose/Description                                                                                                         |
| :---------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| `yarn compile`    | Build the application source code to a distributable format (artifacts).                                                    |
| `yarn clean`      | Remove all compiled/built artifacts.                                                                                        |
| `yarn image/push` | Creates and pushes a Docker image for the relevant app to the [private docker-registry](./installation/docker-registry.md). |
| `yarn start`      | Starts the application [locally for development](./testing-apps-locally.md) and debugging.                                  |
| `yarn start/dev`  | Not used directly; this is the command invoked by [telepresence](https://www.telepresence.io/) when developing locally.     |

### Deployments

> These tasks do accept a `--scope` parameter.

| Task                     | Purpose/Description                                                                                                         |
| :----------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| `yarn intialize-secrets` | Create required (dummy/blank) secrets in Vault, required for a deployment. Intention is to set secret values in Vault's UI. |
| `yarn deploy`            | Deploy defined app(s) to Kubernetes or provisioned VMs/LXC containers.                                                      |
