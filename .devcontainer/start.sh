#!/usr/bin/env bash
set -e

# Switch to the .devcontainer folder
cd "$(dirname "${BASH_SOURCE[0]}")"

./start-openvpn.sh &
./wrapdocker.sh &
./start-telepresence.sh
