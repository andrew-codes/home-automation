# Kubernetes

## Prepare

Create a VM in Proxmox named `ubuntu-server` and install ubuntu server 20.x. This will act as the base for the docker-registry. Ensure the username is hl and password is `{PM_PASSWORD}`.

## Provision

```bash
yarn provision k8s prod-main.env
```

## Secrets

```bash
yarn initialize-secrets --scope @ha/k8s
```

> Set secrets via the Vault UI.

## Additional Vault Configuration

Sign into the Vault UI. Add the following to the default policy:

```hcl
path "auth/kubernetes/config" {
    capabilities = ["create", "update"]
}

path "auth/kubernetes/role/app" {
    capabilities = ["create", "update"]
}

path "sys/auth/kubernetes" {
    capabilities = ["create", "update"]
}
```

Then create a new policy, named app, and save the following to it:

```hcl
path "kv/*" {
    capabilities = ["read"]
}
```

# Deploy

```bash
yarn deploy --scope @ha/k8s
```
