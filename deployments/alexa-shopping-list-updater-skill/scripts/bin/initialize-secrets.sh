#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/az-login.sh
set -o allexport
source .provision-vars.env
set +o allexport
popd

az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "alexa-shopping-list-skill-DNS-USERNAME" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "alexa-shopping-list-skill-DNS-PASSWORD" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "alexa-shopping-list-skill-DNS-DOMAIN" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "alexa-shopping-list-skill-INLETS-IP" --value "change me"
