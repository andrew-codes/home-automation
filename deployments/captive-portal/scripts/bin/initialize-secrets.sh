#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv put kv/unifi \
    IP="" \
    PORT="" \
    USERNAME="" \
    PASSWORD=""

vault kv put kv/captive-portal \
    DOMAIN=""
