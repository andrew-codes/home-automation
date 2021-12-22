#!/usr/bin/env bash

pushd .
cd ../../
./scripts/bin/az-login.sh
set -o allexport
source .provision-vars.env
set +o allexport
popd

az group create --name $AZURE_RESOURCE_GROUP --location $AZURE_LOCATION
az keyvault create --name $AZURE_KEY_VAULT_NAME --resource-group $AZURE_RESOURCE_GROUP --location $AZURE_LOCATION || true
