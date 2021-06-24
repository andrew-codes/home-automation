#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

pushd .
cd ../../
source scripts/bin/vault.sh
popd
export MACHINE_PASSWORD=$(vault kv get -format=json cubbyhole/k8s | jq .data.MACHINE_PASSWORD | sed 's/"//g')

ansible-playbook ./postdeploy.yml -i ./hosts.yml --extra-vars "ansible_become_pass='$MACHINE_PASSWORD'"
