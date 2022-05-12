#!/usr/bin/env bash

if [ -z "$1" ]; then
    echo "Must provide the absolute path to the config directory to be copied."
    exit 1
fi

echo "Copying config"
rsync --recursive -I --delete $1/appdaemon.yaml /config/appdaemon.yaml
rsync --recursive -I --delete $1/configuration.yaml /config/configuration.yaml
rsync --recursive -I --delete $1/customize.yaml /config/customize.yaml
rsync --recursive -I --delete $1/apps /config
rsync --recursive -I --delete $1/dashboards /config
rsync --recursive -I --delete $1/lovelace /config
rsync --recursive -I --delete $1/packages /config
rsync --recursive -I --delete $1/custom_components/qrcode /config/custom_components
