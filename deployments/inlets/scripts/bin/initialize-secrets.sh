#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv put kv/inlets \
    INLETS_PRO_LICENSE="" \
    CLIENT_ID="" \
    CLIENT_SECRET="" \
    SUBSCRIPTION_ID="" \
    TENANT_ID=""
