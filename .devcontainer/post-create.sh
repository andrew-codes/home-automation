#!/usr/bin/env bash
set -e

git config --global --add safe.directory /workspaces/home-automation
/usr/local/share/docker-init.sh

corepack enable
corepack use yarn
yarn set version 4.1.1

touch .secrets.env
echo -e "
ONEPASSWORD_SERVER_URL=""
ONEPASSWORD_TOKEN=""
ONEPASSWORD_VAULT_ID=""
" >.secrets.env
