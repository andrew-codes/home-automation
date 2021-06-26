#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv put kv/k8s \
    POD_NETWORK_CIDR="" \
    MACHINE_PASSWORD="" \
    CLUSTER_IP="192.168.3.51"
