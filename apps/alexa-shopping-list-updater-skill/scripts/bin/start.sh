#!/usr/bin/env bash

source ../../secrets.sh

echo "Will Start on Port 8082"

NODE_APP_IMAGE_COUNT_BY_REFERENCE=$(docker image ls --filter reference="node-app:latest" | wc -l | awk '{ print $1 }')

if [ "$NODE_APP_IMAGE_COUNT_BY_REFERENCE" -ne "2" ]; then
    echo "No image found for alexa-shopping-list-updater-skill:latest, building developer image first for app package: @ha/alexa-shopping-list-updater-skill-app"
    yarn image/local
fi

telepresence --namespace "home-automation" --swap-deployment "alexa-shopping-list-updater-skill" --docker-run --rm -t -v "$PWD/../../:/app" -p "8080:80" -p "8081:5000" "node-app:latest" yarn lerna run start/dev --scope "@ha/alexa-shopping-list-updater-skill-app" --stream <<<$DEV_MACHINE_PASSWORD
