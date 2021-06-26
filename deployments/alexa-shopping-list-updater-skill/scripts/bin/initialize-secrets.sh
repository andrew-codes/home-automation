#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv put kv/alexa-shopping-list-skill \
    DNS_USERNAME="" \
    DNS_PASSWORD="" \
    DNS_DOMAIN="" \
    INLETS_IP=""
