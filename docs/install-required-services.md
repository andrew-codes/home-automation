# Installing Required Services

## Let's Encrypt Cert Issuers

```bash
kubectl apply -f k8s/setup/.secrets/lets-encrypt-cert-issuers.yml
```

## Installing the Docker Registry

```bash
kubectl apply -f k8s/docker-registry/index.yml
```

## Point Domain to IP

Before creating an ingress to access the registry, point your docker domain to the public IP of your Digital Ocean droplet. The droplet is automatically created via inlets and already tunneling securely to the cluster.

> It is important to point your docker domain to the droplet's public IP before proceeding!

> DO NOT CONTINUE until the docker domain resolves properly; `ping $DOCKER_REGISTRY_DOMAIN`

## Testing Docker Registry

```bash
# This will use lets encrypt's staging API.
# Use this for testing.
kubectl apply -f k8s/docker-registry/.secrets/ingress-staging.yml

# View pending certificates
kubectl get certs --all-namespaces
```

Then, navigate to `https://$DOCKER_REGISTRY_DOMAIN`. Ensure the page is accessible, status 200, and that the certificate is from lets encrypt.

## Migrating to Production

```bash
kubectl apply -f k8s/docker-registry/.secrets/ingress-production.yml

# View pending certificates
kubectl get certs --all-namespaces
```

Then, navigate to `https://$DOCKER_REGISTRY_DOMAIN`. Ensure the page is accessible, status 200, and that the certificate is from lets encrypt. The certificate should now be valid.
