#!/usr/bin/env bash

source secrets.sh

mkdir -p ansible/k8s/.secrets
cat >ansible/k8s/.secrets/setup_k8s.yml <<EOL
---
digitalocean_token: "$DIGITALOCEAN_TOKEN"
backup_bucket: "$BACKUP_BUCKET"
backup_uri: "$BACKUP_URI"
inlets_pro_license: "$INLETS_PRO_LICENSE"
docker_registry_domain: "$DOCKER_REGISTRY_DOMAIN"
pod_network_cidr: "$POD_NETWORK_CIDR"
azure_backup_resource_group: "$AZURE_RESOURCE_GROUP"
azure_storage_account_id: "$AZURE_STORAGE_ACCOUNT_ID"
azure_backup_subscription_id: "$AZURE_BACKUP_SUBSCRIPTION_ID"
blob_container: "$BLOB_CONTAINER"
azure_subscription_id: "$AZURE_SUBSCRIPTION_ID"
EOL

cat >ansible/k8s/.secrets/inlets-pro.license <<EOL
$INLETS_PRO_LICENSE
EOL

cat >ansible/k8s/.secrets/azure-cloud-credentials.json <<EOL
$INLETS_PRO_AZURE_EXIT_SERVER_CONFIG
EOL

cat >ansible/k8s/.secrets/backup-cloud-credentials.ini <<EOL
AZURE_SUBSCRIPTION_ID=$AZURE_SUBSCRIPTION_ID
AZURE_TENANT_ID=$AZURE_TENANT_ID
AZURE_CLIENT_ID=$AZURE_CLIENT_ID
AZURE_CLIENT_SECRET=$AZURE_CLIENT_SECRET
AZURE_RESOURCE_GROUP=$AZURE_RESOURCE_GROUP
AZURE_CLOUD_NAME=$AZURE_CLOUD_NAME_VELERO_OUTPUT_FILE
EOL

cat >ansible/k8s/.secrets/k8s-digitalocean-secret-token.yml <<EOL
---
apiVersion: v1
kind: Secret
stringData:
  digitalocean_token: $DIGITALOCEAN_TOKEN
type: Opaque
EOL

mkdir -p k8s/setup/tmp
cat >k8s/setup/tmp/flannel-pod-network-cidr.json <<EOL
{"Network": "$POD_NETWORK_CIDR","Backend":{"Type":"vxlan"}}
EOL

mkdir -p ansible/pihole/.secrets
cat >ansible/pihole/.secrets/pihole.yml <<EOL
---
pihole_password: "$PIHOLE_PASSWORD"
EOL
