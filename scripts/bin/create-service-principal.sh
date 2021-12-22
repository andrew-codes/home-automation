#!/usr/bin/env bash

pushd .
set -o allexport
source .secrets.env
source .provision-vars.env
set +o allexport
popd

SERVICE_PRINCIPAL_OUTPUT=$(az ad sp create-for-rbac --name $AZURE_SERVICE_PRINCIPAL_NAME --role Contributor)
echo $SERVICE_PRINCIPAL_OUTPUT
AZURE_SERVICE_PRINCIPAL_APP_ID=$(echo -n $SERVICE_PRINCIPAL_OUTPUT | jq '.appId' | sed 's/"//g')
AZURE_SERVICE_PRINCIPAL_PASSWORD=$(echo -n $SERVICE_PRINCIPAL_OUTPUT | jq '.password' | sed 's/"//g')
AZURE_SERVICE_PRINCIPAL_TENANT=$(echo -n $SERVICE_PRINCIPAL_OUTPUT | jq '.tenant' | sed 's/"//g')

echo '
AZURE_SERVICE_PRINCIPAL_APP_ID="$AZURE_SERVICE_PRINCIPAL_APP_ID"
AZURE_SERVICE_PRINCIPAL_PASSWORD="$AZURE_SERVICE_PRINCIPAL_PASSWORD"
AZURE_SERVICE_PRINCIPAL_TENANT="$AZURE_SERVICE_PRINCIPAL_TENANT"
' >>.secrets.env

az keyvault set-policy --name $AZURE_KEY_VAULT_NAME --spn $AZURE_SERVICE_PRINCIPAL_APP_ID --secret-permissions get list set
