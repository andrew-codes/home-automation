#!/usr/bin/env bash

function start-locally() {
    : ${1?"Usage: $0; first argument must the k8s namespace"} ${2?"Usage: $0; second argument is the deployment name"} ${3?"Usage: $0; third argument is dev docker image"}

    NODE_APP_IMAGE_COUNT_BY_REFERENCE=$(docker image ls --filter reference="node-app:latest" | wc -l | awk '{ print $1 }')

    if [ "$NODE_APP_IMAGE_COUNT_BY_REFERENCE" -ne "2" ]; then
        echo "No image found for $2:latest, building developer image first for app package: @ha/$2-app"
        yarn image/local
    fi

    telepresence --namespace "$1" --swap-deployment "$2" --docker-run --rm -it -v "$PWD:/app" -p "$4:80" "$3" yarn lerna run start/dev --scope "@ha/$2-app" --stream
}
