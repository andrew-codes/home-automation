#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/az-login.sh
popd

export GRAFANA_DNS_USERNAME=$(az keyvault secret show --vault-name "kv-home-automation" --name "grafana-dns-username" | jq -r '.value')
export GRAFANA_DNS_PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "grafana-dns-password" | jq -r '.value')
export GRAFANA_DOMAIN=$(az keyvault secret show --vault-name "kv-home-automation" --name "grafana-domain" | jq -r '.value')
export INLETS_IP=$(az keyvault secret show --vault-name "kv-home-automation" --name "grafana-inlets-ip" | jq -r '.value')

curl -X POST "https://$GRAFANA_DNS_USERNAME:$GRAFANA_DNS_PASSWORD@domains.google.com/nic/update?hostname=$GRAFANA_DOMAIN&myip=$INLETS_IP"
envsubst <"$1" | kubectl apply -f -
