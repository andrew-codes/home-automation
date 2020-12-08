#!/usr/bin/env bash

source ../../secrets.sh

envsubst <"$1" | kubectl apply -f -
