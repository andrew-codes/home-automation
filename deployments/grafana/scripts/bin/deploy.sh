#!/usr/bin/env bash

pushd .
cd ../../
set -o allexport
source .external-ports.env
set +o allexport
popd

mkdir -p dist
jsonnet -J vendor --ext-str "EXTERNAL_GRAFANA_PORT=$EXTERNAL_GRAFANA_PORT" src/dashboards.jsonnet > dist/dashboards.json
kubectl patch deployment grafana -patch-file dist/dashboards.json -type=json
