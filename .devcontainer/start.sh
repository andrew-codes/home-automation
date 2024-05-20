#!/usr/bin/env bash
set -e

if [ -f .secrets.env ]; then
    set -o allexport
    source .secrets.env
    set +o allexport
fi

yarn