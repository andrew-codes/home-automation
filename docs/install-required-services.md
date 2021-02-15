# Installing Required Services

> Be sure to fill in the required secrets for the Docker registry in your `secrets.sh` file.

## Installing the Docker Registry

```bash
yarn deploy --scope @ha/docker-registry
```

### Point Docker Domain to IP

Point your `$DOCKER_REGISTRY_DOMAIN` to the `$CLUSTER_IP` in a DNS entry. If you do not have a local DNS, use local `/etc/hosts` files.

> Note: use the local cluster IP! Do not use or expose the docker registry to the public Internet.

> When using local `/etc/hosts` to redirect your domain to the cluster, note that every machine that will push/pull from the docker registry must have an updated `/etc/hosts` file.

### Testing: Push Images to Registry

```bash
docker pull alpine:latest
docker tag alpine:latest "$DOCKER_REGISTRY_DOMAIN:5000/alpine:latest"
docker push "$DOCKER_REGISTRY_DOMAIN:5000/alpine:latest"
```

> The registry is not secured! Anyone with LAN access can push/pull, so do not expose this externally!
