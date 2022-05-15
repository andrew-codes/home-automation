#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

pushd .
cd ../../
source scripts/bin/az-login.sh
popd

export PIHOLE_PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "pihole-PASSWORD" | jq -r '.value')
export PUBLIC_KEY=$(az keyvault secret show --vault-name "kv-home-automation" --name "github-action-runners-HOME-AUTOMATION-PUBLIC-KEY" | jq -r '.value')

mkdir -p .secrets
cat >.secrets/ansible-secrets.yml <<EOL
---
pihole_password: "$PIHOLE_PASSWORD"
EOL

echo -e "$PUBLIC_KEY" >.secrets/ha.pub

ansible-playbook ./deploy.yml -i ./hosts.yml
