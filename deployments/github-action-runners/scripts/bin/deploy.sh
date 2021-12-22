#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/az-login.sh
set -o allexport
source ./.provision-vars.env
source .external-ports.env
set +o allexport
popd

export GITHUB_RUNNER_TOKEN=$(az keyvault secret show --vault-name "kv-home-automation" --name "github-action-runners-GITHUB-TOKEN" | jq -r '.value')
yarn seal-github-secret andrew-codes home-automation VAULT_TOKEN "$VAULT_TOKEN"
yarn seal-github-secret andrew-codes home-automation VAULT_ADDR "http://vault:8200"

export HOME_AUTOMATION_PRIVATE_SSH_KEY=$(az keyvault secret show --vault-name "kv-home-automation" --name "github-action-runners-HOME-AUTOMATION-PRIVATE-SSH-KEY" | jq -r '.value')
mkdir -p .secrets
cat <<EOL >.secrets/config-maps.yml
apiVersion: v1
kind: ConfigMap
metadata:
  name: home-automation-private-key
  namespace: default
data:
  value: "$HOME_AUTOMATION_PRIVATE_SSH_KEY"
EOL

kubectl apply -f namespace.yml
envsubst <external-services.yml | kubectl apply -f -
kubectl apply -f .secrets/config-maps.yml
kubectl create secret generic controller-manager --namespace=actions-runner-system --from-literal=github_token="$GITHUB_RUNNER_TOKEN"
kubectl apply -f https://github.com/actions-runner-controller/actions-runner-controller/releases/download/v0.20.2/actions-runner-controller.yaml
kubectl apply -f runners.yml

export GITHUB_ACTION_JEST_REPORTER_TOKEN=$(az keyvault secret show --vault-name "kv-home-automation" --name "github-action-runners-GITHUB-ACTION-JEST-REPORTER-TOKEN" | jq -r '.value')
yarn seal-github-secret andrew-codes home-automation JEST_REPORTER_TOKEN "$GITHUB_ACTION_JEST_REPORTER_TOKEN"

# Move these to relevant packages ===
export MQTT_PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "mqtt-PASSWORD" | jq -r '.value')
export MQTT_USERNAME=$(az keyvault secret show --vault-name "kv-home-automation" --name "mqtt-USERNAME" | jq -r '.value')
export GAMING_ROOM_GAMING_PC_MAC=$(az keyvault secret show --vault-name "kv-home-automation" --name "home-assistant-GAMING-ROOM-GAMING-PC-MAC" | jq -r '.value')
export MACHINE_PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "k8s-MACHINE-PASSWORD" | jq -r '.value')
export AZURE_SUBSCRIPTION_ID=$(az keyvault secret show --vault-name "kv-home-automation" --name "azure-subscription-id" | jq -r '.value')
export AZURE_SERVICE_PRINCIPAL_PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "azure-service-principal-password" | jq -r '.value')
export AZURE_SERVICE_PRINCIPAL_APP_ID=$(az keyvault secret show --vault-name "kv-home-automation" --name "azure-service-principal-app-id" | jq -r '.value')
export AZURE_SERVICE_PRINCIPAL_TENANT=$(az keyvault secret show --vault-name "kv-home-automation" --name "azure-service-principal-tenant-id" | jq -r '.value')
yarn seal-github-secret andrew-codes home-automation AZURE_SUBSCRIPTION_ID "$AZURE_SUBSCRIPTION_ID"
yarn seal-github-secret andrew-codes home-automation AZURE_SERVICE_PRINCIPAL_PASSWORD "$AZURE_SERVICE_PRINCIPAL_PASSWORD"
yarn seal-github-secret andrew-codes home-automation AZURE_SERVICE_PRINCIPAL_APP_ID "$AZURE_SERVICE_PRINCIPAL_APP_ID"
yarn seal-github-secret andrew-codes home-automation AZURE_SERVICE_PRINCIPAL_TENANT "$AZURE_SERVICE_PRINCIPAL_TENANT"
yarn seal-github-secret andrew-codes home-automation GAMING_ROOM_GAMING_PC_MAC "$GAMING_ROOM_GAMING_PC_MAC"
yarn seal-github-secret andrew-codes home-automation MACHINE_PASSWORD "$MACHINE_PASSWORD"
yarn seal-github-secret andrew-codes home-automation MQTT_CONNECTION "$(
  cat <<EOL
\$MQTT_HOST = "$PROD_K8S_MAIN_NODE_IP"
\$MQTT_PORT = $EXTERNAL_MQTT_PORT
\$MQTT_USERNAME = "$MQTT_USERNAME"
\$MQTT_PASSWORD = "$MQTT_PASSWORD"
EOL
)"
