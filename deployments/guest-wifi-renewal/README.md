# Captive Portal for Guest Detection

This application listens to the MQTT topic, `/homeassistant/guest/renew-devices`, and, upon receiving a matching message, will renew all guest device leases. When a guest registers their device via the [captive portal](../captive-portal/README.md), they are given a 3-day lease. To ensure that they do not need to go through the captive portal process again, an automation in Home Assistant runs once a day to renew all registered guest leases.

## Running Locally

> See the [testing applications locally guide](../../docs/testing-apps-locally.md) for more details.

1. Ensure you have a working cluster running (follow the [brand new installation guide](../../README.md))
1. `yarn start --scope @ha/guest-wifi-renewal-app`
1. View the console output when MQTT messages are received.
