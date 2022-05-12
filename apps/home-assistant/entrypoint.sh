#!/usr/bin/env bash

export ROOT="${TELEPRESENCE_ROOT:-}"

source ${ROOT}/root/set_ssh_keys.sh
source ${ROOT}/root/generate_secrets_yaml.sh >/config/secrets.yaml

if [ ! -z "$TELEPRESENCE_ROOT" ]; then
    sudo ./sync.sh
    export SHELL=/bin/bash
    chokidar "/home-assistant-src/**/*.yaml" -c "rsync --recursive --delete -I --exclude=\"*.db*\" /home-assistant-src/* /config" &
    chokidar "/config/**/*.yaml" --debounce 60000 -c "bash -c '/reload.sh | true'" &
fi

hass --config /config
