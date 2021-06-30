#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

pushd .
cd ../../
source scripts/bin/vault.sh
popd
export OPENVPN_PASSWORD=$(vault kv get -format=json kv/openvpn | jq .data.PASSWORD | sed 's/"//g')

mkdir -p .secrets
cat >.secrets/ansible-secrets.yml <<EOL
---
openvpn_password: "$OPENVPN_PASSWORD"
EOL

ansible-playbook ./deploy.yml -i ./hosts.yml
