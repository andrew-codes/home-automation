#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv put kv/velero \
    AZURE_BLOB_CONTAINER="" \
    AZURE_BACKUP_RESOURCE_GROUP="" \
    AZURE_STORAGE_ACCOUNT_ID="" \
    AZURE_BACKUP_SUBSCRIPTION_ID="" \
    AZURE_TENANT_ID="" \
    AZURE_CLIENT_ID="" \
    AZURE_CLIENT_SECRET=""
