# Captive Portal for Guest Detection

This application listens to the MQTT topic, `homeassistant/group/guest/renew`, and, upon receiving a matching topic, will renew all guest device leases. When a guest registers their device via the [captive portal](../captive-portal/index.md), they are given a 3-day lease.

> To ensure that they do not need to go through the captive portal process again, create an automation in Home Assistant that runs once a day and publishes the `homeassistant/group/guest/renew` topic to MQTT.
