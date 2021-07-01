#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/vault.sh
popd

vault kv put kv/github-action-runners \
    GITHUB_TOKEN="" \
    HOME_AUTOMATION_PRIVATE_SSH_KEY="" \
    GITHUB_ACTION_JEST_REPORTER_TOKEN=""
