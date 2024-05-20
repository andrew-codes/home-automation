#!/usr/bin/env bash
set -e

mkdir -p ~/.docker
echo "{}" >~/.docker/config.json

export ONEPASSWORD_SERVER_URL="$OP_CONNECT_HOST"
export ONEPASSWORD_TOKEN="$OP_CONNECT_TOKEN"
export ONEPASSWORD_VAULT_ID="$OP_CONNECT_VAULT_ID"

yarn
yarn nx run secrets:dev-env

./.devcontainer/save-config.sh
# ./start-telepresence.sh
