#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

pushd .
cd ../../
source scripts/bin/vault.sh
popd
export PIHOLE_PASSWORD=$(vault kv get -format=json cubbyhole/pihole | jq .data.password | sed 's/"//g')

mkdir -p .secrets
cat >.secrets/ansible-secrets.yml <<EOL
---
pihole_password: "$PIHOLE_PASSWORD"
EOL

ansible-playbook ./deploy.yml -i ./hosts.yml
