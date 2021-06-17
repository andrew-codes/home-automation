#!/usr/bin/env bash

export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

ansible-playbook ./deploy.yml -i ./hosts.yml
