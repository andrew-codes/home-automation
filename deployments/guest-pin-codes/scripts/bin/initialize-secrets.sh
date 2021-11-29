#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv put kv/guest-pin-codes \
    GOOGLE_CALENDAR_ID="" \
    GOOGLE_PRIVATE_KEY="" \
    DOOR_LOCKS="" \
    GUEST_LOCK_CODE_EXCLUSIONS="" \
    GUEST_CODE_INDEX_OFFSET="" \
    NUMBER_OF_GUEST_CODES=""
