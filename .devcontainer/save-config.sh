#!/usr/bin/env bash
set -e

export ONEPASSWORD_VAULT_ID="$OP_CONNECT_VAULT_ID"

# Save the configuration from the secret if it is present
mkdir -p ~/.kube
echo -e "$(op read op://$OP_CONNECT_VAULT_ID/s6mbwk4ppivpoyjgmzba3nsyu4/secret-value)}" >~/.kube/config

mkdir -p ~/.docker
echo "{}" >~/.docker/config.json
