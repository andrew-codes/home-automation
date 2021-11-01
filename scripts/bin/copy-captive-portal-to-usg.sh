#!/usr/bin/env bash

source scripts/bin/vault.sh

export DOMAIN=$(vault kv get -format=json kv/captive-portal | jq .data.data.DOMAIN | sed -e 's/^"//' -e 's/"$//')
export UNIFI_IP=$(vault kv get -format=json kv/unifi | jq .data.data.IP | sed -e 's/^"//' -e 's/"$//')

mkdir -p .secrets

cat >.secrets/captive-portal.html <<EOL
<!DOCTYPE html>
<html>
  <head>
    <title>Smith-Simms Wifi</title>
    <meta http-equiv="refresh" content="0;url=https://$DOMAIN?mac=<unifi var="mac" />">
  </head>
  <body>
  </body>
</html>

EOL

scp .secrets/captive-portal.html "root@$UNIFI_IP:/data/unifi/data/sites/default/app-unifi-hotspot-portal/index.html"

rm -rf .secrets/captive-portal.html
