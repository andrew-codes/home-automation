#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

ansible-playbook ./deploy.yml -i ./hosts.yml

echo "Don't forget to store the ouput secret keys and token!"