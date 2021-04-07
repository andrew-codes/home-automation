#!/usr/bin/env bash

mkdir -p tmp
curl -fsSL -o tmp/kube-prometheus.zip https://github.com/prometheus-operator/kube-prometheus/archive/refs/tags/v0.7.0.zip
tar -xvf tmp/kube-prometheus.zip

kubectl create -f kube-prometheus-0.7.0/manifests/setup
until kubectl get servicemonitors --all-namespaces; do
    date
    sleep 1
    echo ""
done
kubectl create -f kube-prometheus-0.7.0/manifests/

rm -rf tmp
rm -f kube-prometheus-0.7.0
