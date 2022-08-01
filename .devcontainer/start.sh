#!/usr/bin/env bash
set -e

chown -R root /workspaces/
# Switch to the .devcontainer folder
cd "$(dirname "${BASH_SOURCE[0]}")"

./save-config.sh
./start-openvpn.sh &
./wrapdocker.sh &
# ./start-telepresence.sh
