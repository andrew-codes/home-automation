#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

pushd .
cd ../../
source scripts/bin/vault.sh
popd
export AZURE_BACKUP_RESOURCE_GROUP=$(vault kv get -format=json kv/velero | jq .data.AZURE_BACKUP_RESOURCE_GROUP | sed 's/"//g' | sed 's/"//g')
export AZURE_STORAGE_ACCOUNT_ID=$(vault kv get -format=json kv/velero | jq .data.AZURE_STORAGE_ACCOUNT_ID | sed 's/"//g' | sed 's/"//g')
export AZURE_BACKUP_SUBSCRIPTION_ID=$(vault kv get -format=json kv/velero | jq .data.AZURE_BACKUP_SUBSCRIPTION_ID | sed 's/"//g' | sed 's/"//g')
export AZURE_BLOB_CONTAINER=$(vault kv get -format=json kv/velero | jq .data.AZURE_BLOB_CONTAINER | sed 's/"//g' | sed 's/"//g')
export AZURE_TENANT_ID=$(vault kv get -format=json kv/velero | jq .data.AZURE_TENANT_ID | sed 's/"//g' | sed 's/"//g')
export AZURE_CLIENT_ID=$(vault kv get -format=json kv/velero | jq .data.AZURE_CLIENT_ID | sed 's/"//g' | sed 's/"//g')
export AZURE_CLIENT_SECRET=$(vault kv get -format=json kv/velero | jq .data.AZURE_CLIENT_SECRET | sed 's/"//g' | sed 's/"//g')
export MACHINE_PASSWORD=$(vault kv get -format=json kv/k8s | jq .data.MACHINE_PASSWORD | sed 's/"//g' | sed 's/"//g')

mkdir -p .secrets
cat >.secrets/ansible-secrets.yml <<EOL
---
azure_backup_resource_group: "$AZURE_BACKUP_RESOURCE_GROUP"
azure_storage_account_id: "$AZURE_STORAGE_ACCOUNT_ID"
azure_backup_subscription_id: "$AZURE_BACKUP_SUBSCRIPTION_ID"
blob_container: "$AZURE_BLOB_CONTAINER"
EOL

cat >.secrets/backup-cloud-credentials.ini <<EOL
AZURE_SUBSCRIPTION_ID="$AZURE_BACKUP_SUBSCRIPTION_ID"
AZURE_TENANT_ID="$AZURE_TENANT_ID"
AZURE_CLIENT_ID="$AZURE_CLIENT_ID"
AZURE_CLIENT_SECRET="$AZURE_CLIENT_SECRET"
AZURE_RESOURCE_GROUP="$AZURE_BACKUP_RESOURCE_GROUP"
AZURE_CLOUD_NAME=AzurePublicCloud
EOL

ansible-playbook ./deploy.yml -i ./hosts.yml --extra-vars "ansible_become_pass='$MACHINE_PASSWORD'"
