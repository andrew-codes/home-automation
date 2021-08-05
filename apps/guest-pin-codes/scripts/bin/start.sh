#!/usr/bin/env bash

pushd .
cd ../../
set -o allexport
source ./.secrets.env
set +o allexport
popd

telepresence --swap-deployment "guest-pin-codes" --docker-run --rm -t -v "$PWD/../../:/app" -e NODE_ENV=development "node-app:latest" yarn lerna run start/dev --scope "@ha/guest-pin-codes-app" --stream <<<$DEV_MACHINE_PASSWORD
