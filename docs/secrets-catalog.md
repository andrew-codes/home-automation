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

## Other Secrets

These are set after the initial provisioning, but in the same file, `./secrets.sh`.

```bash
# Docker registry domain; e.g. docker.yourdomain.com
export DOCKER_REGISTRY_DOMAIN=""

# Public IP of the Digital Ocean droplet created by inlets.
export INLETS_IP=""

# GitHub Action Runners
export KUBE_CONFIG=$(cat ~/.kube/config)
# GitHub Token; requires full read/write to repos, workflows, and admin:org.
export GITHUB_RUNNER_TOKEN=""

# ====================================
# Required for Home Assistant

# MQTT credentials.
export MQTT_USERNAME=""
export MQTT_PASSWORD=""

# Home Assistant
export HOME_ASSISTANT_REPO_URL="git@github.com:andrew-codes/home-automation.git"
export HOME_ASSISTANT_ID_RSA=$(
    cat <<EOL
-----BEGIN OPENSSH PRIVATE KEY-----
-----END OPENSSH PRIVATE KEY-----
EOL
)
export HOME_ASSISTANT_DOMAIN=""

# [Optional] Google Dynamic DNS for Home Assistant DNS record.
export HOME_ASSISTANT_DNS_USERNAME=""
export HOME_ASSISTANT_DNS_PASSWORD=""

## Home Assistant secrets.yaml values.
# ------------------------------------
export LATITUDE=""
export LONGITUDE=""
export ELEVATION=""
export TIME_ZONE=""
export UNIT_SYSTEM=""
# Home Assistant Long Lived Access Token
export HA_TOKEN=""
export APPDAEMON_URL=""
export APPDAEMON_PASSWORD=""
export WITHINGS_CLIENT_ID=""
export WITHINGS_CLIENT_SECRET=""
export GAMING_ROOM_TV_IP=""
export GAMING_ROOM_TV_MAC=""
export GAMING_ROOM_NVIDIA_SHIELD_IP=""
export GAMING_ROOM_GAMING_PC_MAC=""
export GAMING_ROOM_GAMING_PC_IP=""
export ROUTER_IP=""

# SSH key with NO passphrase
export HOME_AUTOMATION_SSH_PRIVATE_KEY=$(
    cat <<EOL
-----BEGIN OPENSSH PRIVATE KEY-----
-----END OPENSSH PRIVATE KEY-----
EOL
)
export HOME_AUTOMATION_SSH_PUBLIC_KEY=$(
    cat <<EOL
EOL
)
# ------------------------------------
# ====================================

# Captive Portal
export USG_IP=""
export USG_PORT=""
export USG_USERNAME=""
export USG_PASSWORD=""
```
