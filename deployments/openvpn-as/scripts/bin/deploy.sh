#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

pushd .
cd ../../
source scripts/bin/az-login.sh
popd

export OPENVPN_PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "openvpn-PASSWORD")

mkdir -p .secrets
cat >.secrets/ansible-secrets.yml <<EOL
---
openvpn_password: "$OPENVPN_PASSWORD"
EOL

ansible-playbook ./deploy.yml -i ./hosts.yml
