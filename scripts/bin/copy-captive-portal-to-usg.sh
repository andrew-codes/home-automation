#!/usr/bin/env bash

source secrets.sh

mkdir -p .secrets

cat >.secrets/captive-portal.html <<EOL
<!DOCTYPE html>
<html>
  <head>
    <title>Smith-Simms Wifi</title>
    <meta http-equiv="refresh" content="0;url=http://$CLUSTER_IP:30516?mac=<unifi var="mac" />">
  </head>
  <body>
  </body>
</html>

EOL

scp .secrets/captive-portal.html "ubnt@$USG_IP:/usr/lib/unifi/data/sites/default/app-unifi-hotspot-portal/index.html"
