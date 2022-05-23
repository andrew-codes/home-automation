#!/usr/bin/env bash

kubectl apply -f deployment/index.yml

kubectl rollout restart deployment external-services-dns-updater
