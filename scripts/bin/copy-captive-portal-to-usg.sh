#!/usr/bin/env bash

source secrets.sh

mkdir -p .secrets

cat >.secrets/captive-portal.html <<EOL
<!DOCTYPE html>
<html>
  <head>
    <title>Smith-Simms Wifi</title>
    <meta http-equiv="refresh" content="0;url=http://$CLUSTER_IP:$EXTERNAL_CAPTIVE_PORTAL_PORT?mac=<unifi var="mac" />">
  </head>
  <body>
  </body>
</html>

EOL

scp .secrets/captive-portal.html "root@$UNIFI_IP:/data/unifi/data/sites/default/app-unifi-hotspot-portal/index.html"

rm -rf .secrets/captive-portal.html
