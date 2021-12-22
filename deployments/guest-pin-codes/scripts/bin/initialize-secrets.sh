#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/az-login.sh
set -o allexport
source .provision-vars.env
set +o allexport
popd

az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "guest-pin-codes-GOOGLE-CALENDAR-ID" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "guest-pin-codes-GOOGLE-PRIVATE-KEY" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "guest-pin-codes-DOOR-LOCKS" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "guest-pin-codes-GUEST-LOCK-CODE-EXCLUSIONS" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "guest-pin-codes-GUEST-CODE-INDEX-OFFSET" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "guest-pin-codes-NUMBER-OF-GUEST-CODES" --value "change me"
