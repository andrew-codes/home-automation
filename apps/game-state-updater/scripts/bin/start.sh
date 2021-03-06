#!/usr/bin/env bash

source ../../secrets.sh

NODE_APP_IMAGE_COUNT_BY_REFERENCE=$(docker image ls --filter reference="node-app:latest" | wc -l | awk '{ print $1 }')

if [ "$NODE_APP_IMAGE_COUNT_BY_REFERENCE" -ne "2" ]; then
    echo "No image found for node-app:latest, building developer image first for app package: @ha/game-state-updater-app"
    yarn image/local
fi

telepresence --namespace home-automation --swap-deployment game-cache --docker-run --rm -t -v "$PWD/../../:/app" node-app:latest yarn lerna run start/dev --scope "@ha/game-state-updater-app" --stream <<<$DEV_MACHINE_PASSWORD
