#!/usr/bin/env bash

source secrets.sh

mkdir -p ansible/k8s/.secrets
cat >ansible/k8s/.secrets/setup_k8s.yml <<EOL
---
docker_registry_domain: "$DOCKER_REGISTRY_DOMAIN"
pod_network_cidr: "$POD_NETWORK_CIDR"
azure_backup_resource_group: "$AZURE_RESOURCE_GROUP"
azure_storage_account_id: "$AZURE_STORAGE_ACCOUNT_ID"
azure_backup_subscription_id: "$AZURE_BACKUP_SUBSCRIPTION_ID"
blob_container: "$BLOB_CONTAINER"
azure_inlets_subscription_id: "$AZURE_INLETS_SUBSCRIPTION_ID"
EOL

cat >ansible/k8s/.secrets/inlets-pro.license <<EOL
$INLETS_PRO_LICENSE
EOL

cat >ansible/k8s/.secrets/azure-cloud-credentials.json <<EOL
{
  "clientId": "$AZURE_INLETS_CLIENT_ID",
  "clientSecret": "$AZURE_INLETS_CLIENT_SECRET",
  "subscriptionId": "$AZURE_INLETS_SUBSCRIPTION_ID",
  "tenantId": "$AZURE_INLETS_TENANT_ID",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
EOL

cat >ansible/k8s/.secrets/backup-cloud-credentials.ini <<EOL
AZURE_SUBSCRIPTION_ID=$AZURE_SUBSCRIPTION_ID
AZURE_TENANT_ID=$AZURE_TENANT_ID
AZURE_CLIENT_ID=$AZURE_CLIENT_ID
AZURE_CLIENT_SECRET=$AZURE_CLIENT_SECRET
AZURE_RESOURCE_GROUP=$AZURE_RESOURCE_GROUP
AZURE_CLOUD_NAME=$AZURE_CLOUD_NAME_VELERO_OUTPUT_FILE
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
