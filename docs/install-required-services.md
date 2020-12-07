# Installing Required Services

## Installing the Docker Registry

```bash
yarn deploy --scope @ha/docker-registry
```

## Point Domain to IP

Before creating an ingress to access the registry, point your docker domain to the public IP of your Digital Ocean droplet. The droplet is automatically created via inlets and already tunneling securely to the cluster.

> It is important to point your docker domain to the droplet's public IP before proceeding!

> DO NOT CONTINUE until the docker domain resolves properly; `ping $DOCKER_REGISTRY_DOMAIN`

## Testing Docker Registry

```bash
yarn ingress/stage

# View pending certificates
kubectl get certs --all-namespaces
```

Then, navigate to `https://$DOCKER_REGISTRY_DOMAIN`. Ensure the page is accessible, status 200, and that the certificate is from lets encrypt.

## Migrating to Production

```bash
yarn ingress/prod

# View pending certificates
kubectl get certs --all-namespaces
```

Then, navigate to `https://$DOCKER_REGISTRY_DOMAIN`. Ensure the page is accessible, status 200, and that the certificate is from lets encrypt. The certificate should now be valid.
