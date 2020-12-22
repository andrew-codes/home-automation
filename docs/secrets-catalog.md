## Secrets Catalog

This documents all secrets used by the repo. This serves as a reference for creating the `./secrets.sh` file.

All secrets belong in the `./secret.sh` file.

> DANGER: This file is ignored. DO NOT COMMIT THIS TO THE REPO!!!

## Initial Provisioning

These are the secrets required to provision/install the cluster:

```bash
#!/usr/bin/env bash

export CLUSTER_IP=""

# Ubuntu server hl user password
export MACHINE_PASSWORD=''

# Your email
export EMAIL=""

# API token to create droplets in Digital Ocean
export DIGITALOCEAN_TOKEN=""
# Digital Ocean Spaces (for backup)
export SPACES_ACCESS_KEY=""
export SPACES_ACCESS_SECRET_KEY=""
export BACKUP_BUCKET=""
export BACKUP_URI=""

# Docker registry domain; e.g. docker.yourdomain.com
export DOCKER_REGISTRY_DOMAIN=""

# Inlets pro license value
export INLETS_PRO_LICENSE=""
export POD_NETWORK_CIDR="192.168.100.0/24"
```

## All Secrets

See the `./secrets.template.sh` for a list of all secrets
