#!/usr/bin/env bash

kubectl rollout restart deployment compreface-postgres --namespace home-automation
kubectl rollout restart deployment compreface-api --namespace home-automation
kubectl rollout restart deployment compreface-admin --namespace home-automation
kubectl rollout restart deployment compreface-fe --namespace home-automation
kubectl rollout restart deployment compreface-core --namespace home-automation