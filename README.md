# My Home Automation

This mono-repo consists of several applications and services I use to create my home automation. Most services/applications run in a local Kubernetes cluster.

## Topics

1. [Installation guide](./docs/installation-guide.md)
1. [Viewing the Kubernetes dashboard](./docs/kubernetes-dashboard.md)
1. [Kubernetes cluster backup and restore](./docs/kubernetes-backup-and-restore.md)
1. [Testing/running apps/services locally](./docs/testing-apps-locally.md)

## Applications

Application documentation is within its deployment configuration in the `./k8s/*` directories. Application source code is in the `./apps/*` directories.

- [MQTT](./k8s/mqtt/README.md)
- [Home Assistant](./k8s/home-assistant/README.md)
- [GraphQL Home API](./k8s/graphql-api/README.md)
- [Guest Detection: Captive Portal](./k8s/captive-portal/README.md)
- [Guest Detection: Guest Device Wifi Renewals](./k8s/guest-wifi-renewal/README.md)
- [Metrics with Prometheus and Grafana](./k8s/metrics/README.md)

## Packages

- [Burning Installation Images to USB](./packages/image/README.md)
- [Automating the Addition of Github Secrets](./packages/github-secrets/README.md)

## Automations

See a [list of automations](./docs/automations.md) for regression testing purposes.
