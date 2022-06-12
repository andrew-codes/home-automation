#!/usr/bin/env bash

export ROOT="${TELEPRESENCE_ROOT:-}"

source ${ROOT}/root/set_ssh_keys.sh
source ${ROOT}/root/generate_secrets_yaml.sh >/config/secrets.yaml

if [ ! -z "$TELEPRESENCE_ROOT" ]; then
    export SHELL=/bin/bash
    rsync -a /tmp/config/ /config
    /sync.sh /home-assistant-src
    chokidar "/home-assistant-src/**/*.yaml" "/home-assistant-src/custom_components/**/*.*" -c "bash -c '/sync.sh /home-assistant-src'" &
    chokidar "/config/**/*.yaml" --debounce 20000 -c "bash -c '/reload.sh || true'" &
fi

hass --config /config
