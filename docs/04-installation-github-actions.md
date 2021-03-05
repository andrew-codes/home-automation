# Automate Deployments via GitHub Actions

## Manual Deployments

At this set in the guide, you should be able to push/pull Docker images from your locally running registry. Deploy apps via the CLI command: `yarn deploy`. However, many require setting appropriate secrets beforehand. See the `README` of each deployable app for more details (found in the `k8s` directory).

For example, to deploy Home Assistant, run `yarn deploy --scope @ha/home-assistant`. Now you can make local changes and deploy the impacted apps to the Kubernetes cluster. However, this guide will help you automate this process via local GitHub actions.

## The Goal

> Remember, this all happens in the local cluster.

### Commits to Main

1. Push a new commit to the `main` branch
1. GitHub signals to spin up a container running locally in your cluster
   - This container has yarn, node, and all the things required to compile any application in the repository
1. The runner container compiles only apps that have changed in the most recent commit
1. The runner then builds the apps' Docker images
   - Only impacted apps are built
1. The runner pushes new docker images to your private registry
1. Finally, the runner deploys affected apps by pulling down the latest image from the registry
1. GitHub reports the status of the deployment back to the commit with a Pass/Fail icon
1. GitHub can display the logs of the workflow for debugging purposes

### Opening/Committing a PR

1. Run all tests
1. Report test status to PR
1. Report test failures to PR via GitHub Checks API with annotations

## Installation

### GitHub Actions Secrets

Ensure necessary secrets are set for the "Required for GitHub Action Deployments" section in `secrets.sh`; which will require the creation of two GitHub access tokens.

Next, run `./set_github_secrets.sh`. This will save the necessary secrets to GitHub via the GitHub API.

### Seal Secrets

To seal the secrets for use in Kubernetes; encrypt them so that they can be committed and deployed by running:

```bash
yarn seal --scope @ha/github-action-runners --stream
```

> This should output files in the directory: `./k8s/github-action-runners/secrets`.

> Commit the files found in `./k8s/github-action-runners/secrets`.

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

# Next

At this point, you should have a fully deployed Kubernetes cluster running in a VM on Proxmox; complete with all the services necessary to begin running home automation apps/services. However, before deploying all the apps, ensure you have completed the remaining secrets sections in your `secrets.sh` file. Additional information on these secrets are located in the [secrets catalog](./06-installation-secrets-catalog.md).
