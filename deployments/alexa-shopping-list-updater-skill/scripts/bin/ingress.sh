#!/usr/bin/env bash

source ../../secrets.sh

curl -X POST "https://$ALEXA_SHOPPING_LIST_SKILL_DNS_USERNAME:$ALEXA_SHOPPING_LIST_SKILL_DNS_PASSWORD@domains.google.com/nic/update?hostname=$ALEXA_SHOPPING_LIST_SKILL_DOMAIN&myip=$INLETS_IP"
envsubst <"$1" | kubectl apply -f -
