#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

ANSIBLE_CONFIG=../../ansible/ansible.cfg

wakeonlan $GAMING_PC_MAC
ansible-playbook "scripts/bin/deploy.yml" -i ../../ansible/hosts.yml --extra-vars "ansible_become_pass='$MACHINE_PASSWORD' ansible_password='$MACHINE_PASSWORD'"
