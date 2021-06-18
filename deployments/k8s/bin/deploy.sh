#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

ansible-playbook ./deploy.yml -i ./hosts.yml --extra-vars "ansible_become_pass='$MACHINE_PASSWORD'"
