#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/az-login.sh
set -o allexport
source .provision-vars.env
set +o allexport
set -o allexport
source ./.provision-vars.env
set +o allexport
popd

az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "k8s-POD-NETWORK-CIDR" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "k8s-MACHINE-PASSWORD" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "k8s-CLUSTER-IP" --value "change me"
