#!/usr/bin/env bash

source ../../secrets.sh

echo "Will Start on Port 8080 and 8081"

NODE_APP_IMAGE_COUNT_BY_REFERENCE=$(docker image ls --filter reference="node-app:latest" | wc -l | awk '{ print $1 }')

if [ "$NODE_APP_IMAGE_COUNT_BY_REFERENCE" -ne "2" ]; then
    echo "No image found for graphql-api:latest, building developer image first for app package: @ha/graphql-api-app"
    yarn image/local
fi
echo "$PWD"
echo "$DEV_MACHINE_PASSWORD" | {
    read
    telepresence --namespace "home-automation" --swap-deployment "graphql-api" --docker-run --rm -t -v "$PWD/../../:/app" -p "8080:80" -p "8081:5000" "node-app:latest" yarn lerna run start/dev --scope "@ha/graphql-api-app" --stream
}
