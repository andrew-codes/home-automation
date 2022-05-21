#!/usr/bin/env bash

mkdir -p dist
CWD="$PWD"

cd ../../
source scripts/bin/az-login.sh
set -o allexport
source .external-ports.env
set +o allexport

export DEPLOY_GRAFANA_USERNAME=$(az keyvault secret show --vault-name "kv-home-automation" --name "grafana-username" | jq -r '.value')
export DEPLOY_GRAFANA_PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "grafana-password" | jq -r '.value')
export DEPLOY_GRAFANA_INFLUXDB_TOKEN=$(az keyvault secret show --vault-name "kv-home-automation" --name "grafana-influxdb-token" | jq -r '.value')
export DEPLOY_EXTERNAL_GRAFANA_PORT="$EXTERNAL_GRAFANA_PORT"

./scripts/bin/jsonnet.sh "$CWD/src/deployment.jsonnet" "$CWD/dist/deployment.json"

# jq .grafana[] dist/deployment.json | kubectl apply -f -
