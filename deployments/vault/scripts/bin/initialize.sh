#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

mkdir -p .secrets
ansible-playbook ./initialize.yml -i ./hosts.yml

echo "Don't forget to store the ouput secret keys and token!"