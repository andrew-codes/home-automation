#!/usr/bin/env bash

# Catalog of all secrets:
#   - those used for installation
#   - those used after installation
# See the [secrets catalog](./docs/secrets-catalog.md) for details on what secrets are needed for installation.

# =================================
# Required for Initial Provisioning
# =================================
# Your developer machine's admin user password; required for running locally via telepresence.
export DEV_MACHINE_PASSWORD=""
export CLUSTER_IP=""

# Machine provisioning username/password
export MACHINE_USERNAME="hl"
export MACHINE_PASSWORD=""

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
# Local DNS must point this domain to your $CLUSTER_IP
export DOCKER_REGISTRY_DOMAIN=""

# Inlets pro license value
export INLETS_PRO_LICENSE=""
# ===============================

# =======================================
# Required for Docker Registry Deployment
# =======================================
export DOCKER_REGISTRY_USERNAME=""
export DOCKER_REGISTRY_PASSWORD=""
export DOCKER_REGISTRY_CERT_STATE=""
export DOCKER_REGISTRY_CERT_CITY=""
export DOCKER_REGISTRY_CERT_ORG=""
# ===============================

# ======================================
# Required for GitHub Action Deployments
# ======================================
export KUBE_CONFIG=$(cat ~/.kube/config)
# Requires repo read/write, workflow, and org permissions
export GITHUB_RUNNER_TOKEN=""
# Requires repo read/write permissions
export GITHUB_ACTION_JEST_REPORTER_TOKEN=""
# ===============================

# ===========================
# Required for Home Assistant
# ===========================
# Public IP of Digital Ocean droplet, dynamically created by Inlets
export INLETS_IP=""

# Home Assistant Repo URL (this repo)
export HOME_ASSISTANT_REPO_URL=""
# SSH Key with repo access; no pass phrase
export REPO_SSH_PRIVATE_KEY=$(
    cat <<EOL
-----BEGIN OPENSSH PRIVATE KEY-----
-----END OPENSSH PRIVATE KEY-----
EOL
)
# e.g. ha.yourdomain.com
# Public/Dynamic DNS record should point this domain to your $INLETS_IP
export HOME_ASSISTANT_DOMAIN=""
# Only used if using Google DNS for dynamic DNS record for $HOME_ASSISTANT_DOMAIN
export HOME_ASSISTANT_DNS_USERNAME=""
export HOME_ASSISTANT_DNS_PASSWORD=""

# Externally exposed nodePort for MQTT from the cluster.
export MQTT_USERNAME=""
export MQTT_PASSWORD=""

# Home Assistant configuration values
export LATITUDE=""
export LONGITUDE=""
export ELEVATION=""
export TIME_ZONE=""
export UNIT_SYSTEM=""
# Long-lived HA token
export HA_TOKEN=""
export APPDAEMON_URL=""
export APPDAEMON_PASSWORD=""
# Withings developer app (see https://www.home-assistant.io/integrations/withings/ for more details)
export WITHINGS_CLIENT_ID=""
export WITHINGS_CLIENT_SECRET=""
export GAMING_ROOM_TV_IP=""
export GAMING_ROOM_TV_MAC=""
export GAMING_ROOM_NVIDIA_SHIELD_IP=""
export GAMING_ROOM_GAMING_PC_MAC=""
export GAMING_ROOM_GAMING_PC_IP=""
export GAMING_ROOM_GAMING_PC_USERNAME=""

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
export ROUTER_IP=""
export MS_TEAMS_STATUS_ACTIVE_WEBHOOK_ID=""
export MS_TEAMS_STATUS_BE_RIGHT_BACK_WEBHOOK_ID=""
export MS_TEAMS_STATUS_BUSY_WEBHOOK_ID=""
export MS_TEAMS_STATUS_AWAY_WEBHOOK_ID=""
export MS_TEAMS_STATUS_DO_NOT_DISTURB_WEBHOOK_ID=""
export MS_TEAMS_STATUS_OFFLINE_WEBHOOK_ID=""
export MS_TEAMS_STATUS_OFF_WEBHOOK_ID=""
export MS_TEAMS_STATUS_AVAILABLE_IDLE_WEBHOOK_ID=""
# ===============================

# ====================
# Required for GraphQL
# ====================
export UNIFI_IP=""
export UNIFI_PORT=""
export UNIFI_USERNAME=""
export UNIFI_PASSWORD=""
export GRAPHQL_API_TOKEN=""
# ===============================

# =====================
# Required for PS5 Wake
# =====================
export PS5_USER_CREDENTIALS=""
# ===============================
