#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv write cubbyhole/velero \
    azure_blob_container="" \
    azure_backup_resource_group="" \
    azure_storage_account_id="" \
    azure_backup_subscription_id="" \
    azure_tenant_id="" \
    azure_client_id="" \
    azure_client_secret=""
