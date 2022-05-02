#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/az-login.sh
set -o allexport
source .provision-vars.env
set +o allexport
popd

az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "cert-email" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "dns-google-service-account-creds" --value "change me"
