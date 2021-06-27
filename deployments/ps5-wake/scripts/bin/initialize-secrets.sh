#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv put kv/ps5-wake \
    PS5_USER_CREDENTIALS=""
