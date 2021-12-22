#!/usr/bin/env bash

pushd .
set -o allexport
source .secrets.env || true
set +o allexport
popd

az login --service-principal --username $AZURE_SERVICE_PRINCIPAL_APP_ID --password $AZURE_SERVICE_PRINCIPAL_PASSWORD --tenant $AZURE_SERVICE_PRINCIPAL_TENANT
az account set --subscription $AZURE_SUBSCRIPTION_ID
