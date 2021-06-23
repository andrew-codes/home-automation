# Kubernetes

## Provision

```bash
yarn provision k8s prod-main.env
```

## Secrets

```bash
yarn initialize-secrets --scope @ha/k8s
```

> Set secrets via the Vault UI.

# Deploy

```bash
yarn deploy --scope @ha/k8s
```
