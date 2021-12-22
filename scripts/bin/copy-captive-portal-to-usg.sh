#!/usr/bin/env bash

source scripts/bin/az-login.sh

export DOMAIN=$(az keyvault secret show --vault-name "kv-home-automation" --name "captive-portal-DOMAIN")
export UNIFI_IP=$(az keyvault secret show --vault-name "kv-home-automation" --name "unifi-IP")

mkdir -p .secrets

cat >.secrets/captive-portal.html <<EOL
<!DOCTYPE html>
<html>
  <head>
    <title>Smith-Simms Wifi</title>
    <meta http-equiv="refresh" content="0;url=http://$DOMAIN?mac=<unifi var="mac" />">
  </head>
  <body>
  </body>
</html>

EOL

scp .secrets/captive-portal.html "root@$UNIFI_IP:/data/unifi/data/sites/default/app-unifi-hotspot-portal/index.html"

rm -rf .secrets/captive-portal.html
