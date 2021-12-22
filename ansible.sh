#!/usr/bin/env bash

source scripts/bin/az-login.sh

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

export MACHINE_PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "k8s-MACHINE-PASSWORD" | jq -r '.value')

ANSIBLE_CONFIG=./ansible/ansible.cfg

ansible-playbook "$1" -i ansible/hosts.yml --extra-vars "ansible_become_pass='$MACHINE_PASSWORD'"
