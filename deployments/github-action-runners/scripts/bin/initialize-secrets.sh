#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/az-login.sh
set -o allexport
source .provision-vars.env
set +o allexport
popd

az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "github-action-runners-GITHUB-TOKEN" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "github-action-runners-HOME-AUTOMATION-PRIVATE-SSH-KEY" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "github-action-runners-GITHUB-ACTION-JEST-REPORTER-TOKEN" --value "change me"
