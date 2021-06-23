#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv put cubbyhole/docker-registry \
    username="" \
    password="" \
    email=""
