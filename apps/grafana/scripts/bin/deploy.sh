#!/usr/bin/env bash

mkdir -p distj
CWD="$PWD"

pushd .
cd ../../
set -o allexport
source .external-ports.env
set +o allexport

export DEPLOY_GRAFANA_USERNAME=$(az keyvault secret show --vault-name "kv-home-automation" --name "grafana-username" | jq -r '.value')
export DEPLOY_GRAFANA_PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "grafana-password" | jq -r '.value')
export DEPLOY_GRAFANA_INFLUXDB_TOKEN=$(az keyvault secret show --vault-name "kv-home-automation" --name "grafana-influxdb-token" | jq -r '.value')
export DEPLOY_EXTERNAL_GRAFANA_PORT="$EXTERNAL_GRAFANA_PORT"

./scripts/bin/jsonnet.sh "$CWD/deployment/index.jsonnet" "$CWD/dist/index.json"

jq .grafana[] "$CWD/dist/index.json" | kubectl apply -f -

popd

kubectl -n monitoring rollout restart deployment grafana
