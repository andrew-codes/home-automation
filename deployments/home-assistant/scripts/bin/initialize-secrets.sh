#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/az-login.sh
set -o allexport
source .provision-vars.env
set +o allexport
popd

az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-APPDAEMON-URL" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-DOUBLE-TAKE-TOKEN" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-ELEVATION" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-GAMING-ROOM-GAMING-PC-IP" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-GAMING-ROOM-GAMING-PC-MAC" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-GAMING-ROOM-MACHINE-USERNAME" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-GAMING-ROOM-NVIDIA-SHIELD-IP" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-GAMING-ROOM-PLAYSTATION-5-IP" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-GAMING-ROOM-TV-IP" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-GAMING-ROOM-TV-MAC" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-GITHUB-ISSUE-TOKEN" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-GOOGLE-CALENDAR-CLIENT-ID" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-GOOGLE-CALENDAR-CLIENT-SECRET" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-HA-TOKEN" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-HA-URL" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-HOME-AUTOMATION-PRIVATE-SSH-KEY" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-HOME-AUTOMATION-PUBLIC-SSH-KEY" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-JIRA-AUTHORIZATION-HEADER" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-LATITUDE" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-LONGITUDE" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-POSTGRES-DB" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-POSTGRES-PASSWORD" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-POSTGRES-USER" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-PROXMOX-HOST" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-PROXMOX-PASSWORD" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-PROXMOX-USERNAME" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-ROUTER-IP" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-SPOTCAST-DC-2" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-SPOTCAST-DC" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-SPOTCAST-KEY-2" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-SPOTCAST-KEY" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-SPOTIFY-CLIENT-ID" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-SPOTIFY-CLIENT-SECRET" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-TIME-ZONE" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-UNIT-SYSTEM" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-WITHINGS-CLIENT-ID" --value "change me"
az keyvault secret set --vault-name $AZURE_KEY_VAULT_NAME --name "home-assistant-WITHINGS-CLIENT-SECRET" --value "change me"
