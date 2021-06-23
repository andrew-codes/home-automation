#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv put cubbyhole/inlets \
    inlets_pro_license="" \
    client_id="" \
    client_secret="" \
    subscription_id="" \
    tenant_id=""
