#!/usr/bin/env bash

curl -X POST -H "Authorization: Bearer $HASS_TOKEN" -H "Content-Type: application/json" "$HASS_SERVER/api/services/homeassistant/restart"
