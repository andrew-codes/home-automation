#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
set -o allexport
source ./.provision-vars.env
set +o allexport
popd

vault kv put kv/k8s \
    POD_NETWORK_CIDR="" \
    MACHINE_PASSWORD="" \
    CLUSTER_IP="$PROD_K8S_MAIN_NODE_IP"
