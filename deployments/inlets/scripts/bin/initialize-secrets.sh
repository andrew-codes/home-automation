#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv write cubbyhole/k8s \
    inlets_pro_license="" \
    client_id="" \
    client_secret="" \
    subscription_id="" \
    tenant_id=""
