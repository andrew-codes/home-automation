#!/usr/bin/env bash

export ROOT="${TELEPRESENCE_ROOT:-}"

source ${ROOT}/vault/secrets/env.sh
set +e
source ${ROOT}/root/set_ssh_keys.sh
rm -rf /home-assistant/secrets.yaml
cp -rf ${ROOT}/vault/secrets/secrets.yaml /home-assistant
set -e

hass --config /home-assistant
