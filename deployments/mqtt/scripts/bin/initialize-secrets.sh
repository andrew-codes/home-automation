#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv put cubbyhole/mqtt \
    username="" \
    password=""
