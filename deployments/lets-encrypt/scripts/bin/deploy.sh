#!/usr/bin/env bash

source ../../secrets.sh
envsubst <issuers.yml | kubectl apply -f -
