#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv write cubbyhole/k8s \
    pod-network-cidr="" \
    machine-password="" \
    cluster-ip="192.168.3.50"
