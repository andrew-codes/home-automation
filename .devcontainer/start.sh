#!/usr/bin/env bash
set -e


if [ -f .secrets.env ]; then
set -o allexport
    source .secrets.env
    set +o allexport    

    yarn
    yarn nx run secrets:dev-env
fi

./.devcontainer/save-config.sh &&
./.devcontainer/start-openvpn.sh &

# ./start-telepresence.sh
