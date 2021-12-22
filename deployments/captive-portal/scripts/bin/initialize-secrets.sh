#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/az-login.sh
set -o allexport
source .provision-vars.env
set +o allexport
popd

az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "unifi-IP" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "unifi-PORT" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "unifi-USERNAME" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "unifi-PASSWORD" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "captive-portal-DOMAIN" --value "change me"
