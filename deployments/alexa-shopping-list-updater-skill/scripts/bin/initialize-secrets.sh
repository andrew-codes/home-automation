#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv put cubbyhole/alexa-shopping-list-skill \
    dns-username="" \
    dns-password="" \
    dns-domain="" \
    inlets-ip=""