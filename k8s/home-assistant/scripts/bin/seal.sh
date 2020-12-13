#!/usr/bin/env bash

source ../../secrets.sh

mkdir -p secrets
mkdir -p .secrets

# DOCKER CREDS
kubectl create secret docker-registry regcred --dry-run=client --namespace="home-automation" --docker-server="$DOCKER_REGISTRY_DOMAIN:5000" --docker-username="$DOCKER_REGISTRY_USERNAME" --docker-password="$DOCKER_REGISTRY_PASSWORD" --docker-email="$EMAIL" -o json >".secrets/regcred.json"
kubeseal --namespace "home-automation" <".secrets/regcred.json" >"secrets/regcred.json"
rm -rf .secrets/regcred.json

# Config Checkokut SSH
echo "$HOME_ASSISTANT_ID_RSA" >.secrets/id_rsa
kubectl create secret generic ssh --dry-run=client --namespace="home-automation" --from-file=id_rsa=".secrets/id_rsa" -o json >".secrets/ssh.json"
kubeseal --namespace "home-automation" <".secrets/ssh.json" >"secrets/ssh.json"
rm -rf .secrets/id_rsa
rm -rf .secrets/ssh.json

# Gaming PC SSH Public Key
echo "$HOME_AUTOMATION_SSH_PUBLIC_KEY" >.secrets/home-automation-ssh.pub
echo "$HOME_AUTOMATION_SSH_PRIVATE_KEY" >.secrets/home-automation-ssh
kubectl create secret generic home-automation-ssh --dry-run=client --namespace="home-automation" --from-file=pub=".secrets/home-automation-ssh.pub" --from-file=private=".secrets/home-automation-ssh" -o json >".secrets/home-automation-ssh.json"
kubeseal --namespace "home-automation" <".secrets/home-automation-ssh.json" >"secrets/home-automation-ssh-ssh.json"
rm -rf .secrets/home-automation-ssh.pub
rm -rf .secrets/home-automation-ssh
rm -rf .secrets/home-automation-ssh.json

# HA Secrets

cat >.secrets/secrets.yaml <<EOL
latitude: $LATITUDE
longitude: $LONGITUDE
elevation: $ELEVATION
time_zone: $TIME_ZONE
unit_system: $UNIT_SYSTEM
ha_url: https://$HOME_ASSISTANT_DOMAIN
ha_token: $HA_TOKEN
mqtt_username: $MQTT_USERNAME
mqtt_password: $MQTT_PASSWORD
appdaemon_url: $APPDAEMON_URL
appdaemon_password: $APPDAEMON_PASSWORD
withings_client_id: $WITHINGS_CLIENT_ID
withings_client_secret: $WITHINGS_CLIENT_SECRET
gaming_room_tv_ip: $GAMING_ROOM_TV_IP
gaming_room_tv_mac: $GAMING_ROOM_TV_MAC
gaming_room_nvidia_shield_ip: $GAMING_ROOM_NVIDIA_SHIELD_IP
gaming_room_gaming_pc_mac: $GAMING_ROOM_GAMING_PC_MAC
gaming_room_gaming_pc_ip: $GAMING_ROOM_GAMING_PC_IP
router_ip: $ROUTER_IP
turn_off_gaming_room_gaming_pc_command: 'ssh -t -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -i /root/.ssh/id_rsa $MACHINE_USERNAME@$GAMING_ROOM_GAMING_PC_IP cmd.exe "%windir%\System32\rundll32.exe powrprof.dll,SetSuspendState Standby"'
EOL

kubectl create secret generic secrets --dry-run=client --namespace="home-automation" --from-file=yml=".secrets/secrets.yaml" -o json >".secrets/secrets.json"
kubeseal --namespace "home-automation" <".secrets/secrets.json" >"secrets/secrets.json"
rm -rf .secrets/secrets.json
rm -rf .secrets/secrets.yaml

echo "$HOME_ASSISTANT_REPO_URL" >.secrets/repo-url
kubectl create secret generic repo-url --dry-run=client --namespace="home-automation" --from-file=value=".secrets/repo-url" -o json >".secrets/repo-url.json"
kubeseal --namespace "home-automation" <".secrets/repo-url.json" >"secrets/repo-url.json"
rm -rf .secrets/repo-url
rm -rf .secrets/repo-url.json
