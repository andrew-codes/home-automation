#!/usr/bin/env bash

if [ -z "$1" ]; then
    echo "Must provide the absolute path to the config directory to be copied."
    exit 1
fi

echo "Copying config"
rsync -a -I --delete $1/appdaemon.yaml /config/appdaemon.yaml
rsync -a -I --delete $1/configuration.yaml /config/configuration.yaml
rsync -a -I --delete $1/customize.yaml /config/customize.yaml
rsync -a -I --delete $1/apps/ /config/apps
rsync -a -I --delete $1/dashboards/ /config/dashboards
rsync -a -I --delete $1/lovelace/ /config/lovelace
rsync -a -I --delete $1/packages/ /config/packages
