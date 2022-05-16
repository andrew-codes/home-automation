#!/usr/bin/env bash
set -e

# Switch to the .devcontainer folder
cd "$(dirname "${BASH_SOURCE[0]}")"

source start-openvpn.sh &
source wrapdocker.sh &
