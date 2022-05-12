#!/usr/bin/env bash

echo "Copying config"
rsync --recursive -I --delete ./appdaemon.yaml /config/appdaemon.yaml
rsync --recursive -I --delete ./configuration.yaml /config/configuration.yaml
rsync --recursive -I --delete ./customize.yaml /config/customize.yaml
rsync --recursive -I --delete ./apps /config/apps
rsync --recursive -I --delete ./dashboards /config/dashboards
rsync --recursive -I --delete ./lovelace /config/lovelace
rsync --recursive -I --delete ./packages /config/packages
rsync --recursive -I --delete ./custom_components/qrcode /config/custom_components/qrcode
