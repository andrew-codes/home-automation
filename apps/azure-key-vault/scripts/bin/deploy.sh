#!/usr/bin/env bash

pushd .
cd ../../
set -o allexport
source .provision-vars.env
source .secrets.env
set +o allexport
popd

az group create --name $AZURE_RESOURCE_GROUP --location $AZURE_LOCATION
az keyvault create --name $AZURE_KEY_VAULT_NAME --resource-group $AZURE_RESOURCE_GROUP --location $AZURE_LOCATION || true

kubectl create ns akv2k8s
helm repo add spv-charts https://charts.spvapi.no
helm repo update
helm upgrade --install akv2k8s spv-charts/akv2k8s \
    --namespace akv2k8s \
    --set global.keyVaultAuth=environment \
    --set global.env.AZURE_TENANT_ID=$AZURE_SERVICE_PRINCIPAL_TENANT \
    --set global.env.AZURE_CLIENT_ID=$AZURE_SERVICE_PRINCIPAL_APP_ID \
    --set global.env.AZURE_CLIENT_SECRET=$AZURE_SERVICE_PRINCIPAL_PASSWORD \
    --set global.logLevel=debug
