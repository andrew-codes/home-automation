#!/usr/bin/env bash

kubectl get nodes -o json | jq '.items[] | "kubectl taint nodes \(.metadata.name) node.kubernetes.io/disk-pressure-"' | xargs -n 1 bash -c

kubectl get pods --all-namespaces -o json |
    jq '.items[] | select(.status.reason!=null) | select(.status.reason | contains("Evicted")) |
"kubectl delete po \(.metadata.name) --namespace \(.metadata.namespace)"' | xargs -n 1 bash -c

kubectl get nodes -o json | jq '.items[] | "kubectl taint nodes \(.metadata.name) node.kubernetes.io/disk-pressure-"' | xargs -n 1 bash -c
