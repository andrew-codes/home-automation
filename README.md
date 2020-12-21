# My Home Automation

This mono-repo consists of several applications and services I use to create my home automation.

My home automation and, all related services, run in a local Kubernetes cluster. I have automated the provisioning of the cluster, so tearing down or spinning one back up is fairly straight forward. See the [kubernetes cluster setup page](./docs/kubernetes-cluster-setup.md) for more information.

## Topics

1. [Installation guide](./docs/installation-guide.md)
1. [Setting app secrets](./docs/secrets-catalog.md)
1. [Testing locally](./docs/testing-apps-locally.md)

## Applications

Application documentation is located with its deployment configuration in the `./k8s/*` directories. Application source code is located in the `./apps/*` directories.

- [MQTT](./k8s/mqtt/README.md)
- [Home Assistant](./k8s/home-assistant/README.md)
- [GraphQL Home API](./k8s/graphql-api/README.md)
- [Guest Detection: Captive Portal](./k8s/captive-portal/README.md)
- [Guest Detection: Guest Device Wifi Renewals](./k8s/guest-wifi-renewal/README.md)

## Automations

See a [list of automations](./docs/automations.md) for regression testing purposes.
