#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv put kv/guest-pin-codes \
    GOOGLE_CALENDAR_ID="" \
    GOOGLE_PRIVATE_KEY="" \
    GOOGLE_SERVICE_ACCOUNT="" \
    DOOR_LOCKS="" \
    GUEST_LOCK_CODE_EXCLUSIONS=""
