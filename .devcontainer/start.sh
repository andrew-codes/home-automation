#!/usr/bin/env bash
set -e

mkdir -p ~/.docker
echo "{}" >~/.docker/config.json

if [ -f .secrets.env ]; then
    set -o allexport
    source .secrets.env
    set +o allexport

    yarn
    yarn nx run secrets:dev-env
fi

./.devcontainer/save-config.sh
# ./start-telepresence.sh
