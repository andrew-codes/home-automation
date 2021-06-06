# Docker Registry

A private docker registry is deployed to "house" all apps/services' container images.

## Required Secrets

Fill out the secrets for the "# Required for Docker Registry Deployment" section in `secrets.sh`.

## Seal Docker Registry Kubernetes Secrets

Next, we will encrypt the secrets required and stored within Kubernetes. This allows us to commit these secrets to our repo.

> The changes this produces should be committed to the repo.

```
yarn seal --scope @ha/docker-registry
```

## Deploying the Docker Registry

The following command will deploy an insecure Docker registry. DO NOT expose this to the public Internet.

```bash
source secrets.sh
yarn deploy --scope @ha/docker-registry
```

### Point $DOCKER_REGISTRY_DOMAIN to $CLUSTER_IP

> This assumes you are running a local DNS server, such as pihole.

Point your `$DOCKER_REGISTRY_DOMAIN` to the `$CLUSTER_IP` via a DNS entry. As an alternative, you may update the HOST machine `/etc/hosts` file.

> Note: use the local cluster IP! Do not use or expose the docker registry to the public Internet.

## Developer Machine Docker Config

Ensure you can push to your new registry from your local developer machine by adding the following to Docker's engine configuration and restarting Docker.

```json
"insecure-registries": ["$DOCKER_REGISTRY_DOMAIN:5000"]
```

## Testing: Push Images to Registry

```bash
docker pull alpine:latest
docker tag alpine:latest "$DOCKER_REGISTRY_DOMAIN:5000/alpine:latest"
docker push "$DOCKER_REGISTRY_DOMAIN:5000/alpine:latest"
```

# Next

[Automate deployments via GitHub Actions](./04-installation-github-actions.md).
