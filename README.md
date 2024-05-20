# My Home Automation

This mono-repo consists of several applications and services I use to create my home automation. Most services/applications run in a local Kubernetes cluster.

## Topics

1. [Code, Architecture, and Deployment Overview](./docs/overview.md)
1. [Installation guide](./docs/installation-guide.md)
1. [Kubernetes cluster backup and restore](./docs/kubernetes-backup-and-restore.md)
1. [Testing/running apps/services locally](./docs/testing-apps-locally.md)

## Apps/Services

- Home Assistant
  - [Home Assistant](./docs/apps/home-assistant/index.md)
  - [MQTT](./docs/apps/mqtt/index.md)
- [Guest Presence Detection](https://andrew.codes/guest-presence-detection)
  - [Captive Portal](./docs/apps/captive-portal/index.md)
  - [Guest wifi renewal](./docs/apps/guest-wifi-rewewal/index.md)
- Dyanmic Guest Lock PINs from Calender Events
  - [Guest Pin Codes](./docs/apps/guest-pin-codes/index.md)

## Packages

- [Burning Installation Images to USB](./packages/image/README.md)
- [Automating the Addition of Github Secrets](./packages/github-secrets/README.md)
