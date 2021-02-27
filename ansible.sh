#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

source secrets.sh
ANSIBLE_CONFIG=./ansible/ansible.cfg

ansible-playbook "$1" -i ansible/hosts.yml --extra-vars "ansible_become_pass='$MACHINE_PASSWORD'"
