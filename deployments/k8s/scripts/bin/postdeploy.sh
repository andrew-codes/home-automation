#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

pushd .
cd ../../
source scripts/bin/vault.sh
popd
export MACHINE_PASSWORD=$(vault kv get -format=json kv/k8s | jq .data.data.MACHINE_PASSWORD | sed -e 's/^"//' -e 's/"$//')

ansible-playbook ./postdeploy.yml -i ./hosts.yml --extra-vars "ansible_become_pass='$MACHINE_PASSWORD'"
