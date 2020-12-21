#!/usr/bin/env bash

source secrets.sh

mkdir -p ansible/k8s/.secrets
cat >ansible/k8s/.secrets/setup_k8s.yml <<EOL
---
digitalocean_token: "$DIGITALOCEAN_TOKEN"
backup_bucket: "$BACKUP_BUCKET"
backup_uri: "$BACKUP_URI"
inlets_pro_license: "$INLETS_PRO_LICENSE"
pod_network_cidr: "$POD_NETWORK_CIDR"
docker_registry_domain: "$DOCKER_REGISTRY_DOMAIN"
EOL

mkdir -p ansible/windows/.secrets
cat >ansible/windows/.secrets/gaming_pc.yml <<EOL
---
gaming_room_gaming_pc_username: "$GAMING_ROOM_GAMING_PC_USERNAME"
EOL

cat >ansible/windows/.secrets/home-automation-ssh <<EOL
$HOME_AUTOMATION_SSH_PRIVATE_KEY
EOL
chmod 0600 ansible/windows/.secrets/home-automation-ssh
cat >ansible/windows/.secrets/home-automation-ssh.pub <<EOL
$HOME_AUTOMATION_SSH_PUBLIC_KEY
EOL
chmod 0600 ansible/windows/.secrets/home-automation-ssh.pub

cat >ansible/k8s/.secrets/inlets-pro.license <<EOL
$INLETS_PRO_LICENSE
EOL

cat >ansible/k8s/.secrets/backup-cloud-credentials.ini <<EOL
[default]
aws_access_key_id=$SPACES_ACCESS_KEY
aws_secret_access_key=$SPACES_ACCESS_SECRET_KEY
EOL

cat >ansible/k8s/.secrets/k8s-digitalocean-secret-token.yml <<EOL
---
apiVersion: v1
kind: Secret
stringData:
  digitalocean_token: $DIGITALOCEAN_TOKEN
type: Opaque
EOL

mkdir -p apps/playnite-game-data-exporter/.secrets
cat >apps/playnite-game-data-exporter/.secrets/secrets.ps1 <<EOL
\$MQTT_HOST = "$MQTT_HOST"
\$MQTT_USERNAME = "$MQTT_USERNAME"
\$MQTT_PASSWORD = "$MQTT_PASSWORD"
EOL
