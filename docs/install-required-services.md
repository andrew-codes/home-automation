# Installing Required Services

> Be sure you review the required [initial secrets](./secrets-catalog.md#initial-provisioning).

## Installing the Docker Registry

```bash
yarn deploy --scope @ha/docker-registry
```

### Point Docker Domain to IP

Point your `$DOCKER_REGISTRY_DOMAIN` to the **IP of the cluster** in a DNS entry. If you do not have a local DNS, use local `/etc/hosts` files.

> Note: use the local cluster IP! Not an external one; unless you don't care about hitting data caps by ISPs.

> When using local `/etc/hosts` to redirect your domain to the cluster, note this must be done on every machine that will push/pull from the docker registry.

### Testing: Push Images to Registry

```bash
docker pull alpine:latest
docker tag alpine:latest "$DOCKER_REGISTRY_DOMAIN:5000/alpine:latest"
docker push "$DOCKER_REGISTRY_DOMAIN:5000/alpine:latest"
```

> The registry is not secured! Anyone with LAN access can push/pull, so do not expose this externally!

The registry is not protected via a username/password or TLS simply to reduce bandwidth usage for ISP data caps. Pushing/pulling images through an external IP counts as bandwidth to your ISP; which likely has a data cap. You can easily push beyond 1 TB monthly if you make updates frequently.
