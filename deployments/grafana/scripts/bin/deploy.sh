#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/az-login.sh
set -o allexport
source .external-ports.env
set +o allexport
popd

export GRAFANA_GITHUB_CLIENT_ID=$(az keyvault secret show --vault-name "kv-home-automation" --name "grafana-github-client-id" | jq -r '.value')
export GRAFANA_GITHUB_CLIENT_SECRET=$(az keyvault secret show --vault-name "kv-home-automation" --name "grafana-github-client-secret" | jq -r '.value')
export GRAFANA_INFLUXDB_TOKEN=$(az keyvault secret show --vault-name "kv-home-automation" --name "grafana-influxdb-token" | jq -r '.value')

mkdir -p dist
jsonnet -J vendor --ext-str "EXTERNAL_GRAFANA_PORT=$EXTERNAL_GRAFANA_PORT" --ext-str "GRAFANA_INFLUXDB_TOKEN=$GRAFANA_INFLUXDB_TOKEN" --ext-str "GRAFANA_GITHUB_CLIENT_ID=$GRAFANA_GITHUB_CLIENT_ID" --ext-str "GRAFANA_GITHUB_CLIENT_SECRET=$GRAFANA_GITHUB_CLIENT_SECRET" src/dashboards.jsonnet >dist/dashboards.json
jq .grafana[] dist/dashboards.json | kubectl apply -f -
