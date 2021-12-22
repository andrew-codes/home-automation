#!/usr/bin/env bash

pushd .
cd ../../
set -o allexport
source .secrets.env
set +o allexport
popd

NODE_APP_IMAGE_COUNT_BY_REFERENCE=$(docker image ls --filter reference="node-app:latest" | wc -l | awk '{ print $1 }')

if [ "$NODE_APP_IMAGE_COUNT_BY_REFERENCE" -ne "2" ]; then
    echo "No image found for ps5:latest, building developer image first for app package: @ha/ps5-app"
    yarn image/local
fi

telepresence --swap-deployment "ps5" --docker-run --rm -t -v "$PWD/../../:/app" "node-app:latest" yarn lerna run start/dev --scope "@ha/ps5-app" --stream <<<$DEV_MACHINE_PASSWORD
