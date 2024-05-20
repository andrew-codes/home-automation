# Docker Registry

A private docker registry is deployed to "house" all apps/services' container images.

> DO NOT expose this to the public Internet.

## Prepare

Create a VM in Proxmox named `ubuntu-server` and install ubuntu server 20.x. This will act as the base for the docker-registry. Ensure the username is hl and password is `{PM_PASSWORD}`.

## Provision

```bash
yarn provision docker-registry prod.env
```

## Secrets

```bash
yarn initialize-secrets --scope @ha/docker-registry
```

> Set secrets via the Vault UI.

## Deploy

Update the `./deployments/docker-registry/hosts.yml` file with the IP of the new VM.

```bash
yarn deploy --scope @ha/docker-registry
```

### Point docker-registry to VM IP

> This assumes you are running a local DNS server, such as pihole.

Point "docker-registry to the VM IP (`{PROD_DOCKER_IP}` or what is configured in `./.provision-vars.env` file) via a DNS entry.

## Testing: Push Images to Registry

```bash
docker pull alpine:latest
docker tag alpine:latest "docker-registry:5000/alpine:latest"
docker push "docker-registry:5000/alpine:latest"
```
