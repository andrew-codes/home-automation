#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv put kv/github-action-runners \
    KUBE_CONFIG="$(cat ../k8s/.secrets/.kube/config)" \
    GITHUB_TOKEN="" \
    HOME_AUTOMATION_PRIVATE_SSH_KEY=""
