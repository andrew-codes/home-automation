#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv put cubbyhole/guest-pin-codes \
    google-calendar-id="" \
    google-private-key="" \
    google-service-account="" \
    guest-lock-entity-prefixes="" \
    guest-lock-code-exclusions=""
