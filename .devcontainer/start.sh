#!/usr/bin/env bash
set -e

# Switch to the .devcontainer folder
cd "$(dirname "${BASH_SOURCE[0]}")"

if [ -f .secrets.env ]; then
    set -o allexport
    source .secrets.env
    set +o allexport

    yarn
    yarn nx run secrets:dev-env
fi

./save-config.sh &&
./start-openvpn.sh &

# ./start-telepresence.sh
