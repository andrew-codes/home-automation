# Docker Registry

A private docker registry is deployed to "house" all apps/services' container images.

> DO NOT expose this to the public Internet.

## Provision

```bash
yarn provision docker-registry prod.env
```

## Secrets

```bash
yarn initialize-secrets --scope @ha/docker-registry
```

and set secrets via Vault's UI.

## Deploy

```bash
yarn deploy --scope @ha/docker-registry
```

### Point docker-registry to VM IP

> This assumes you are running a local DNS server, such as pihole.

Point "docker-registry to the VM IP (192.168.3.4 or what is configured in `./.provision-vars.env` file) via a DNS entry.

## Testing: Push Images to Registry

```bash
docker pull alpine:latest
docker tag alpine:latest "docker-registry/alpine:latest"
docker push "docker-registry/alpine:latest"
```
