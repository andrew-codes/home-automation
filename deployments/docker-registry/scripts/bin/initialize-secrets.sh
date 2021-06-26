#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv put kv/docker-registry \
    USERNAME="" \
    PASSWORD="" \
    EMAIL="" \
    MACHINE_PASSWORD=""
