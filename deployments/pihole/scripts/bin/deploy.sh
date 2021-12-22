#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

pushd .
cd ../../
source scripts/bin/az-login.sh
popd

export PIHOLE_PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "pihole-PASSWORD")

mkdir -p .secrets
cat >.secrets/ansible-secrets.yml <<EOL
---
pihole_password: "$PIHOLE_PASSWORD"
EOL

ansible-playbook ./deploy.yml -i ./hosts.yml
