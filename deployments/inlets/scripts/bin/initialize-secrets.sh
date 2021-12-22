#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/az-login.sh
set -o allexport
source .provision-vars.env
set +o allexport
popd

az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "inlets-INLETS-PRO-LICENSE" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "inlets-CLIENT-ID" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "inlets-CLIENT-SECRET" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "inlets-SUBSCRIPTION-ID" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "inlets-TENANT-ID" --value "change me"
