#!/usr/bin/env sh

if [ -n $TELEPRESENCE_ROOT ]; then
    source "$TELEPRESENCE_ROOT/vault/secrets/env.sh"
fi

node dist/index.js
