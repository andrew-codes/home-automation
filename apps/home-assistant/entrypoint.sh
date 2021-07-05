#!/usr/bin/env bash

export ROOT="${TELEPRESENCE_ROOT:-}"

source ${ROOT}/vault/secrets/env.sh
source ${ROOT}/root/set_ssh_keys.sh
rm -rf /config/secrets.yaml
cp -rf ${ROOT}/vault/secrets/secrets.yaml /config

if [ ! -z "$TELEPRESENCE_ROOT" ]; then
    sudo -u root rsync --recursive -I --exclude="*.db*" ${ROOT}/config/* /config
    sudo -u root rsync --recursive -I --exclude="*.db*" ${ROOT}/config/. /config
    sudo -u root rsync --recursive -I --exclude="*.db*" /home-assistant-src/* /config
fi

hass --config /config
