#!/usr/bin/env bash
set -e

echo -e "{
\"data-root\": \"/var/lib/docker2\"
}" > /etc/docker/daemon.json
/usr/local/share/docker-init.sh

mkdir -p ~/.kube
echo -e "$(op read op://$OP_CONNECT_VAULT_ID/s6mbwk4ppivpoyjgmzba3nsyu4/secret-value)" >~/.kube/config

touch .secrets.env
echo -e "

ONEPASSWORD_SERVER_URL="$OP_CONNECT_HOST"
ONEPASSWORD_TOKEN="$OP_CONNECT_TOKEN"
ONEPASSWORD_VAULT_ID="$OP_CONNECT_VAULT_ID"

" >.secrets.env

corepack enable
corepack prepare --activate yarn@4.1.1
