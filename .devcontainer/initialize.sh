#!/usr/bin/env bash
set -e

cd "$(dirname "${BASH_SOURCE[0]}")"
cd ../

mkdir -p ~/.kube
echo -e "$(op read op://$OP_CONNECT_HOST/$OP_CONNECT_VAULT_ID/s6mbwk4ppivpoyjgmzba3nsyu4/secret-value)}" >~/.kube/config

touch .secrets.env
echo -e "

ONEPASSWORD_SERVER_URL="http://$OP_CONNECT_HOST"
ONEPASSWORD_TOKEN="$OP_CONNECT_TOKEN"
ONEPASSWORD_VAULT_ID="$OP_CONNECT_VAULT_ID"

" >.secrets.env

corepack enable
corepack prepare --activate yarn@4.1.1
