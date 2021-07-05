#!/usr/bin/env bash

export ROOT="${TELEPRESENCE_ROOT:-}"

source ${ROOT}/vault/secrets/env.sh
set +e
source ${ROOT}/root/set_ssh_keys.sh
set -e
rm -rf /home-assistant/secrets.yaml
cp -rf ${ROOT}/vault/secrets/secrets.yaml /home-assistant

if [ ! -z "TELEPRESENCE_ROOT" ]; then
    sudo -u root source ${ROOT}/root/set_ssh_keys.sh
    sudo -u root cp -rf ${ROOT}/home-assistant/* /home-assistant
    cp -rf /home-assistant-src/* /home-assistant
fi

hass --config /home-assistant
