#!/usr/bin/env bash

export ROOT="${TELEPRESENCE_ROOT:-}"

source ${ROOT}/vault/secrets/env.sh
set +e
source ${ROOT}/root/set_ssh_keys.sh
cp -rf /home-assistant-src/* /home-assistant
rm -rf /home-assistant/secrets.yaml
cp -rf ${ROOT}/vault/secrets/secrets.yaml /home-assistant

if [ ! -z "TELEPRESENCE_ROOT" ]; then
    sudo cp -rf ${ROOT}/home-assistant /home-assistant-prod
    sudo cp -rf /home-assistant-prod/* /home-assistant
    cp -rf /home-assistant-src/* /home-assistant
fi

set -e
hass --config /home-assistant
