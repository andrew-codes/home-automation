#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/az-login.sh
set -o allexport
source .external-ports.env
set +o allexport
popd

export GRAFANA_USERNAME=$(az keyvault secret show --vault-name "kv-home-automation" --name "grafana-username" | jq -r '.value')
export GRAFANA_PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "grafana-password" | jq -r '.value')
export GRAFANA_INFLUXDB_TOKEN=$(az keyvault secret show --vault-name "kv-home-automation" --name "grafana-influxdb-token" | jq -r '.value')

mkdir -p dist
jsonnet -J vendor --ext-str "EXTERNAL_GRAFANA_PORT=$EXTERNAL_GRAFANA_PORT" --ext-str "GRAFANA_INFLUXDB_TOKEN=$GRAFANA_INFLUXDB_TOKEN" --ext-str "GRAFANA_USERNAME=$GRAFANA_USERNAME" --ext-str "GRAFANA_PASSWORD=$GRAFANA_PASSWORD" src/deployment.jsonnet >dist/deployment.json
jq .grafana[] dist/deployment.json | kubectl apply -f -
