#!/usr/bin/env bash

export ROOT="${TELEPRESENCE_ROOT:-}"

source ${ROOT}/vault/secrets/env.sh
source ${ROOT}/root/set_ssh_keys.sh
rm -rf /home-assistant/secrets.yaml
cp -rf ${ROOT}/vault/secrets/secrets.yaml /home-assistant

if [ ! -z "$TELEPRESENCE_ROOT" ]; then
    sudo -u root rsync --recursive -I --exclude="*.db*" --exclude ".git" ${ROOT}/home-assistant/* /home-assistant
    sudo -u root rsync --recursive -I --exclude="*.db*" /home-assistant-src/* /home-assistant
    rm -rf /home-assistant/home-assistant
fi

hass --config /home-assistant
