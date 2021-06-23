#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

export REPO_PRIVATE_SSH_KEY=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.repo-private-ssh-key | sed 's/"//g')
export HOME_AUTOMATION_PUBLIC_SSH_KEY=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.home-automation-public-ssh-key | sed 's/"//g')
export HOME_AUTOMATION_PRIVATE_SSH_KEY=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.home-automation-private-ssh-key | sed 's/"//g')
export LATITUDE=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.latitude | sed 's/"//g')
export LONGITUDE=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.longitude | sed 's/"//g')
export ELEVATION=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.elevation | sed 's/"//g')
export TIME_ZONE=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.time-zone | sed 's/"//g')
export UNIT_SYSTEM=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.unit-system | sed 's/"//g')
export HA_URL=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.ha-url | sed 's/"//g')
export HA_TOKEN=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.ha-token | sed 's/"//g')
export MQTT_USERNAME=$(vault kv get -format=json cubbyhole/mqtt | jq .data.username | sed 's/"//g')
export MQTT_PASSWORD=$(vault kv get -format=json cubbyhole/mqtt | jq .data.password | sed 's/"//g')
export APPDAEMON_URL=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.appdaemon-url | sed 's/"//g')
export APPDAEMON_PASSWORD=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.appdaemon-password | sed 's/"//g')
export WITHINGS_CLIENT_ID=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.withings-client-id | sed 's/"//g')
export WITHINGS_CLIENT_SECRET=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.withings-client-secret | sed 's/"//g')
export GAMING_ROOM_TV_IP=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.gaming-room-tv-ip | sed 's/"//g')
export GAMING_ROOM_TV_MAC=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.gaming-room-tv-mac | sed 's/"//g')
export GAMING_ROOM_NVIDIA_SHIELD_IP=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.gaming-room-nvidia-shield-ip | sed 's/"//g')
export GAMING_ROOM_MACHINE_USERNAME=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.gaming-room-machine-username | sed 's/"//g')
export GAMING_ROOM_GAMING_PC_MAC=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.gaming-room-gaming-pc-mac | sed 's/"//g')
export GAMING_ROOM_GAMING_PC_IP=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.gaming-room-gaming-pc-ip | sed 's/"//g')
export ROUTER_IP=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.router-ip | sed 's/"//g')
export GRAPHQL_URL=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.graphql-url | sed 's/"//g')
export GRAPHQL_API_TOKEN=$(vault kv get -format=json cubbyhole/graphql-api | jq .data.token | sed 's/"//g')
export TURN_OFF_GAMING_ROOM_GAMING_PC_COMMAND=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.turn-off-gaming-room-gaming-pc-command | sed 's/"//g')
export GAMING_ROOM_PLAYSTATION_5_IP=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.gaming-room-playstation-5-ip | sed 's/"//g')
export MS_TEAMS_STATUS_ACTIVE_WEBHOOK_ID=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.ms-teams-status-active-webhook-id | sed 's/"//g')
export MS_TEAMS_STATUS_BUSY_WEBHOOK_ID=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.ms-teams-status-busy-webhook-id | sed 's/"//g')
export MS_TEAMS_STATUS_BE_RIGHT_BACK_WEBHOOK_ID=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.ms-teams-status-be-right-back-webhook-id | sed 's/"//g')
export MS_TEAMS_STATUS_AWAY_WEBHOOK_ID=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.ms-teams-status-away-webhook-id | sed 's/"//g')
export MS_TEAMS_STATUS_DO_NOT_DISTURB_WEBHOOK_ID=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.ms-teams-status-do-not-disturb-webhook-id | sed 's/"//g')
export MS_TEAMS_STATUS_OFFLINE_WEBHOOK_ID=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.ms-teams-status-offline-webhook-id | sed 's/"//g')
export MS_TEAMS_STATUS_OFF_WEBHOOK_ID=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.ms-teams-status-off-webhook-id | sed 's/"//g')
export MS_TEAMS_STATUS_AVAILABLE_IDLE_WEBHOOK_ID=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.ms-teams-status-available-idle-webhook-id | sed 's/"//g')
export VALHEIM_GOOGLE_DOMAIN_USERNAME=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.valheim-google-domain-username | sed 's/"//g')
export VALHEIM_GOOGLE_DOMAIN_PASSWORD=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.valheim-google-domain-password | sed 's/"//g')
export VALHEIM_DOMAIN=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.valheim-domain | sed 's/"//g')
export GITHUB_ISSUES_TOKEN=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.github-issue-token | sed 's/"//g')
export VPN_DNS_USERNAME=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.vpn-dns-username | sed 's/"//g')
export VPN_DNS_PASSWORD=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.vpn-dns-password | sed 's/"//g')
export VPN_DOMAIN=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.vpn-domain | sed 's/"//g')
export GOOGLE_CALENDAR_CLIENT_ID=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.google-calendar-client-id | sed 's/"//g')
export GOOGLE_CALENDAR_CLIENT_SECRET=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.google-calendar-client-secret | sed 's/"//g')
export SPOTIFY_CLIENT_ID=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.spotify-client-id | sed 's/"//g')
export SPOTIFY_CLIENT_SECRET=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.spotify-client-secret | sed 's/"//g')
export SPOTCAST_DC=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.spotcast-dc | sed 's/"//g')
export SPOTCAST_KEY=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.spotcast-key | sed 's/"//g')
export SPOTCAST_DC_2=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.spotcast-dc-2 | sed 's/"//g')
export SPOTCAST_KEY=$(vault kv get -format=json cubbyhole/home-assistant | jq .data.spotcast-key | sed 's/"//g')
export SECRETS_YML=$(
    cat <<EOL
latitude: "$LATITUDE"
longitude: "$LONGITUDE"
elevation: "$ELEVATION"
time_zone: "$TIME_ZONE"
unit_system: "$UNIT_SYSTEM"
ha_url: "$HA_URL"
ha_token: "$HA_TOKEN"
mqtt_username: "$MQTT_USERNAME"
mqtt_password: "$MQTT_PASSWORD"
appdaemon_url: "$APPDAEMON_URL"
appdaemon_password: "$APPDAEMON_PASSWORD"
withings_client_id: "$WITHINGS_CLIENT_ID"
withings_client_secret: "$WITHINGS_CLIENT_SECRET"
gaming_room_tv_ip: "$GAMING_ROOM_TV_IP"
gaming_room_tv_mac: "$GAMING_ROOM_TV_MAC"
gaming_room_nvidia_shield_ip: "$GAMING_ROOM_NVIDIA_SHIELD_IP"
gaming_room_gaming_pc_mac: "$GAMING_ROOM_GAMING_PC_MAC"
gaming_room_gaming_pc_ip: "$GAMING_ROOM_GAMING_PC_IP"
router_ip: "$ROUTER_IP"
graphql_url: "http://graphql-api/graphql"
graphql_authorization: "Bearer $GRAPHQL_API_TOKEN"
turn_off_gaming_room_gaming_pc_command: ssh -n -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -i /root/.ssh/id_rsa $GAMING_ROOM_MACHINE_USERNAME@$GAMING_ROOM_GAMING_PC_IP "C:\Windows\System32\rundll32.exe powrprof.dll,SetSuspendState Standby"
gaming_room_playstation_5_ip: "$PS5_IP"
ms_teams_status_active_webhook_id: "$MS_TEAMS_STATUS_ACTIVE_WEBHOOK_ID"
ms_teams_status_busy_webhook_id: "$MS_TEAMS_STATUS_BUSY_WEBHOOK_ID"
ms_teams_status_be_right_back_webhook_id: "$MS_TEAMS_STATUS_BE_RIGHT_BACK_WEBHOOK_ID"
ms_teams_status_away_webhook_id: "$MS_TEAMS_STATUS_AWAY_WEBHOOK_ID"
ms_teams_status_do_not_disturb_webhook_id: "$MS_TEAMS_STATUS_DO_NOT_DISTURB_WEBHOOK_ID"
ms_teams_status_offline_webhook_id: "$MS_TEAMS_STATUS_OFFLINE_WEBHOOK_ID"
ms_teams_status_off_webhook_id: "$MS_TEAMS_STATUS_OFF_WEBHOOK_ID"
ms_teams_status_available_idle_webhook_id: "$MS_TEAMS_STATUS_AVAILABLE_IDLE_WEBHOOK_ID"
valheim_ddns_rest_url: "https://${VALHEIM_GOOGLE_DOMAIN_USERNAME}:${VALHEIM_GOOGLE_DOMAIN_PASSWORD}@domains.google.com/nic/update?hostname=${VALHEIM_DOMAIN}"
github_authorization_header: "Bearer $GITHUB_ISSUES_TOKEN"
update_vpn_dns_command: curl -X POST "https://$VPN_DNS_USERNAME:$VPN_DNS_PASSWORD@domains.google.com/nic/update?hostname=$VPN_DOMAIN&myip=\$(curl https://checkip.amazonaws.com)"
google_calendar_client_id: "$GOOGLE_CALENDAR_CLIENT_ID"
google_calendar_client_secret: "$GOOGLE_CALENDAR_CLIENT_SECRET"
spotify_client_id: "$SPOTIFY_CLIENT_ID"
spotify_client_secret: "$SPOTIFY_CLIENT_SECRET"
spotcast_dc: "$SPOTCAST_DC"
spotcast_key: "$SPOTCAST_KEY"
spotcast_dc_2: "$SPOTCAST_DC_2"
spotcast_key_2: "$SPOTCAST_KEY_2"
EOL
)

mkdir -p .secrets
echo -n "$(
    cat <<EOL
apiVersion: v1
kind: ConfigMap
metadata:
name: repo-private-ssh-key
namespace: home-automation
data: |
    $REPO_PRIVATE_SSH_KEY

---
apiVersion: v1
kind: ConfigMap
metadata:
name: home-automation-keys
namespace: home-automation
data:
pub: |
    $HOME_AUTOMATION_PUBLIC_SSH_KEY
private: |
    $HOME_AUTOMATION_PRIVATE_SSH_KEY

---
apiVersion: v1
kind: ConfigMap
metadata:
name: secrets-yml
namespace: home-automation
data: |
    $SECRETS_YML
EOL
)" >>.secrets/config-maps.yml

kubectl apply -f .secrets/config-maps.yml
envsubst <home-assistant.yml | kubectl apply -f -
