# Installing Required Services

## Installing the Docker Registry

```bash
yarn deploy --scope @ha/docker-registry
```

## Point Domain to IP

Point your $DOCKER_REGISTRY_DOMAIN to the IP of the cluster in a DNS entry. If you do not have a local DNS, use local `/etc/hosts` files.

> When using local `/etc/hosts` to redirect your domain to the cluster, note this must be done on every machine that will push/pull from the docker registry.

## Login into Docker Registry

```bash
docker login "$DOCKER_REGISTRY_DOMAIN:5000" # Provide username/password
```
