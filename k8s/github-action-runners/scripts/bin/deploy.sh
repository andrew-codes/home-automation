#!/usr/bin/env bash

source ../../secrets.sh

kubectl apply -f namespace.yml -f secrets
kubectl apply -f operator.yml -f runners.yml
