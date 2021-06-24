#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv put cubbyhole/facebox \
    MB_KEY=""
