#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

pushd .
cd ../../
source scripts/bin/az-login.sh
popd

export MACHINE_PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "k8s-MACHINE-PASSWORD")

ansible-playbook ./postdeploy.yml -i ./hosts.yml --extra-vars "ansible_become_pass='$MACHINE_PASSWORD'"
