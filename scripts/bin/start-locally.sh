#!/usr/bin/env bash

function start-locally() {
    : ${1?"Usage: $0; first argument must the k8s namespace"} ${2?"Usage: $0; second argument is the deployment name"} ${3?"Usage: $0; third argument is the local port"}

    IMAGE_COUNT_BY_REFERENCE=$(docker image ls --filter reference="$2:latest" | wc -l | awk '{ print $1 }')
    if [ "$IMAGE_COUNT_BY_REFERENCE" -ne "2" ]; then
        echo "No image found for $2:latest, building developer image first for app package: @ha/$2-app"
        yarn image/local --scope "@ha/$2-app" --stream
    fi

    telepresence --namespace "$1" --swap-deployment "$2" --docker-run --rm -it -v "$PWD:/app" -p "$3:80" "$2:latest" yarn lerna run start --scope "@ha/$2-app" --stream
}
