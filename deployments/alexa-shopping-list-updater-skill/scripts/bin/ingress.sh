#!/usr/bin/env bash

pushd .
cd ../../
source scripts/bin/az-login.sh
popd

export DNS_USERNAME=$(az keyvault secret show --vault-name "kv-home-automation" --name "alexa-shopping-list-skill-DNS-USERNAME" | jq -r '.value')
export DNS_PASSWORD=$(az keyvault secret show --vault-name "kv-home-automation" --name "alexa-shopping-list-skill-DNS-PASSWORD" | jq -r '.value')
export DNS_DOMAIN=$(az keyvault secret show --vault-name "kv-home-automation" --name "alexa-shopping-list-skill-DNS-DOMAIN" | jq -r '.value')
export INLETS_IP=$(az keyvault secret show --vault-name "kv-home-automation" --name "alexa-shopping-list-skill-INLETS-IP" | jq -r '.value')

curl -X POST "https://$DNS_USERNAME:$DNS_PASSWORD@domains.google.com/nic/update?hostname=$DNS_DOMAIN&myip=$INLETS_IP"
envsubst <"$1" | kubectl apply -f -
