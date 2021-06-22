#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv write cubbyhole/home-assistant \
    repo-private-ssh-key="" \
    home-automation-public-ssh-key= "" \
    home-automation-private-ssh-key= "" \
    home-assistant-dns-username="" \
    home-assistant-dns-password="" \
    home-assistant-domain="" \
    inlets-ip="" \
    latitude="" \
    longitude="" \
    elevation="" \
    time-zone="" \
    unit-system="" \
    ha-url="" \
    ha-token="" \
    mqtt-username="" \
    mqtt-password="" \
    appdaemon-url="" \
    appdaemon-password="" \
    withings-client-id="" \
    withings-client-secret="" \
    gaming-room-tv-ip="" \
    gaming-room-tv-mac="" \
    gaming-room-nvidia-shield-ip="" \
    gaming-room-machine-username="" \
    gaming-room-gaming-pc-mac="" \
    gaming-room-gaming-pc-ip="" \
    router-ip="" \
    graphql-url="" \
    graphql-authorization="" \
    turn-off-gaming-room-gaming-pc-command="" \
    gaming-room-playstation-5-ip="" \
    ms-teams-status-active-webhook-id="" \
    ms-teams-status-busy-webhook-id="" \
    ms-teams-status-be-right-back-webhook-id="" \
    ms-teams-status-away-webhook-id="" \
    ms-teams-status-do-not-disturb-webhook-id="" \
    ms-teams-status-offline-webhook-id="" \
    ms-teams-status-off-webhook-id="" \
    ms-teams-status-available-idle-webhook-id="" \
    valheim-google-domain-username="" \
    valheim-google-domain-password="" \
    valheim-domain="" \
    github-issue-token="" \
    vpn-dns-username="" \
    vpn-dns-password="" \
    vpn-domain="" \
    google-calendar-client-id="" \
    google-calendar-client-secret="" \
    spotify-client-id="" \
    spotify-client-secret="" \
    spotcast-dc="" \
    spotcast-key="" \
    spotcast-dc-2="" \
    spotcast-key-2=""
