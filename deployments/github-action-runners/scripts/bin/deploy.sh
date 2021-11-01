#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
set -o allexport
source ./.provision-vars.env
source .external-ports.env
set +o allexport
popd

export GITHUB_RUNNER_TOKEN=$(vault kv get -format=json kv/github-action-runners | jq .data.data.GITHUB_TOKEN | sed -e 's/^"//' -e 's/"$//')
yarn seal-github-secret andrew-codes home-automation VAULT_TOKEN "$VAULT_TOKEN"
yarn seal-github-secret andrew-codes home-automation VAULT_ADDR "http://vault:8200"

export HOME_AUTOMATION_PRIVATE_SSH_KEY=$(vault kv get -format=json kv/github-action-runners | jq .data.data.HOME_AUTOMATION_PRIVATE_SSH_KEY | sed -e 's/^"//' -e 's/"$//')
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
kubectl apply -f https://github.com/summerwind/actions-runner-controller/releases/download/v0.16.1/actions-runner-controller.yaml
kubectl apply -f runners.yml

export GITHUB_ACTION_JEST_REPORTER_TOKEN=$(vault kv get -format=json kv/github-action-runners | jq .data.data.GITHUB_ACTION_JEST_REPORTER_TOKEN | sed -e 's/^"//' -e 's/"$//')
yarn seal-github-secret andrew-codes home-automation JEST_REPORTER_TOKEN "$GITHUB_ACTION_JEST_REPORTER_TOKEN"

# Move these to relevant packages ===
export MQTT_PASSWORD=$(vault kv get -format=json kv/mqtt | jq .data.data.PASSWORD | sed -e 's/^"//' -e 's/"$//')
export MQTT_USERNAME=$(vault kv get -format=json kv/mqtt | jq .data.data.USERNAME | sed -e 's/^"//' -e 's/"$//')
export GAMING_ROOM_GAMING_PC_MAC=$(vault kv get -format=json kv/home-assistant | jq .data.data.GAMING_ROOM_GAMING_PC_MAC | sed -e 's/^"//' -e 's/"$//')
export MACHINE_PASSWORD=$(vault kv get -format=json kv/k8s | jq .data.data.MACHINE_PASSWORD | sed -e 's/^"//' -e 's/"$//')
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
