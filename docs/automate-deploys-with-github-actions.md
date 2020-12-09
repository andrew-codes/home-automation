# Automate Deployments

At this set in the guide, you should be able to push/pull Docker images from your locally running registry. Many apps/services can be deployed via a CLI command: `yarn deploy`; although most have secrets that need to be added beforehand. See the README of each deployable app for more details (found in the `k8s` directory).

For example, to deploy Home Assistant, run `yarn deploy --scope @ha/home-assistant`. Now you can make local changes and deploy the impacted apps to the Kubernetes cluster. However, this guide will help you automate this process via local GitHub actions.

## The Goal

The following is our goal:

1. Push a new commit to the `main` branch
1. GitHub signals to spin up a container running locally in your cluster
   - The container has yarn, node, and all the things required to compile any application in the repository
1. The runner container compiles the apps
   - Only apps have been changed, in the most recent commit, are compiled
1. The runner then builds app Docker images
   - Only impacted apps are built
1. The runner pushes new images to your private registry
1. Finally, the runner deploys impacted apps by pulling down the latest image from the registry
1. GitHub reports the status of the deployment back to the commit with a Pass/Fail icon
1. GitHub can display the logs of the workflow for debugging purposes

> Remember, this all happens in the local cluster.

## Installation

### Additional Secrets

Create an [access token](https://github.com/settings/tokens/new) in GitHub. Ensure it has full access to `repo`, `workflow`, and `admin:org`. Then append the following to your `./secrets.sh` file.

```bash
# GitHub Action Runners
export KUBE_CONFIG=$(cat ~/.kube/config)
export GITHUB_RUNNER_TOKEN=""
```

### Seal Secrets

To seal the secrets; encrypt them so that they can be committed and deployed, run:

```bash
yarn seal --scope @ha/github-action-runners --stream
```

> This should output files in the directory: `./k8s/github-action-runners/secrets`.

### Build Runner Image

```bash
source secrets.sh
yarn image/push --scope @ha/github-action-runner-amd64 --stream
```

> This will build the runner image and push it to your local registry.

### Deploy the Runner To Kubernetes

```bash
yarn deploy --scope @ha/github-action-runners --stream
```
