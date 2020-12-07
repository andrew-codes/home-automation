#!/usr/bin/env bash

export DOCKER_REGISTRY_HOSTNAME=$(cat .secrets/hostname)
envsubst <$1 | kubectl apply -f -
