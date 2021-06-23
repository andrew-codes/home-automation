#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv write cubbyhole/github-action-runners \
    kube-config="$(cat ../k8s/.secrets/.kube/config)" \
    github-token="" \
    home-automation-private-ssh-key=""
