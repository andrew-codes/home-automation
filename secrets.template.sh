#!/usr/bin/env bash

# Catalog of all secrets:
#   - those used for installation
#   - those used after installation
# See the [secrets catalog](./docs/secrets-catalog.md) for details on what secrets are needed for installation.

export CLUSTER_IP=""

# Ubuntu server user and password
export MACHINE_USERNAME=""
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
export DOCKER_REGISTRY_DOMAIN=""

# Inlets pro license value
export INLETS_PRO_LICENSE=""
export POD_NETWORK_CIDR="192.168.100.0/24"
$()$(

    ## Full Secrets Catalog

    These are set after the initial provisioning, but in the same file,
)./secrets.sh$(
    .

)$()bash
#!/usr/bin/env bash

export CLUSTER_IP=""

# Ubuntu server hl user password
export MACHINE_USERNAME=""
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
export DOCKER_REGISTRY_DOMAIN=""
export DOCKER_REGISTRY_USERNAME=""
export DOCKER_REGISTRY_PASSWORD=""
export DOCKER_REGISTRY_CERT_STATE=""
export DOCKER_REGISTRY_CERT_CITY=""
export DOCKER_REGISTRY_CERT_ORG=""

# Inlets pro license value
export INLETS_PRO_LICENSE=""
export POD_NETWORK_CIDR=""
export INLETS_IP=""

# Home Assistant
export HOME_ASSISTANT_REPO_URL=""
# SSH Key with repo access with no pass phrase
export REPO_SSH_PRIVATE_KEY=$(
    cat <<EOL
-----BEGIN OPENSSH PRIVATE KEY-----
-----END OPENSSH PRIVATE KEY-----
EOL
)
export HOME_ASSISTANT_DOMAIN=""
export HOME_ASSISTANT_DNS_USERNAME=""
export HOME_ASSISTANT_DNS_PASSWORD=""

# GitHub Action Runners
export KUBE_CONFIG=$(cat ~/.kube/config)
export GITHUB_RUNNER_TOKEN=""

export EXTERNAL_MQTT_PORT=""
export MQTT_USERNAME=""
export MQTT_PASSWORD=""

export LATITUDE=""
export LONGITUDE=""
export ELEVATION=""
export TIME_ZONE=""
export UNIT_SYSTEM=""
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
export USG_IP=""
export USG_PORT=""
export USG_USERNAME=""
export USG_PASSWORD=""
export GRAPHQL_API_TOKEN=""
