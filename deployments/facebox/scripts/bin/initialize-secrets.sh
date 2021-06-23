#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv write cubbyhole/facebox \
    mb_key=""
