# Automate Deployments via GitHub Actions

## Manual Deployments

At this set in the guide, you should be able to push/pull Docker images from your locally running registry. Deploy apps via the CLI command: `yarn deploy`. For example, to deploy Home Assistant, run `yarn deploy --scope @ha/home-assistant`. Now you can make local changes and deploy the impacted apps to the Kubernetes cluster. This guide will help you automate this process via local GitHub actions.

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

### Secrets

```bash
yarn initialize-secrets --scope @ha/github-action-runners
```

> Set secrets via the Vault UI.

### Build Image

```bash
yarn image/push --scope @ha/github-action-runner-amd64
```

### Deploy

```bash
yarn deploy --scope @ha/github-action-runners
```
