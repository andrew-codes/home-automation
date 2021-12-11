#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv put kv/ps5 \
    CREDENTIALS="" \
    PS5_NAMES=""
