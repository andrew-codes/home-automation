# My Home Automation

This mono-repo consists of several applications and services I use to create my home automation.

My home automation and, all related services, run in a local Kubernetes cluster. I have automated the provisioning of the cluster, so tearing down or spinning one back up is fairly straight forward. See the [kubernetes cluster setup page](./docs/kubernetes-cluster-setup.md) for more information.

## Installing a Brand New Environment

1. [Install and provision kubernetes cluster](./docs/kubernetes-cluster-setup.md)
   - [Kubernetes cluster default features; what is installed?](./docs/kubernetes-cluster-features.md)
1. [Setup the private Docker Registry](./docs/install-required-services.md)
1. [Enable Automated Deploys](./docs/automate-deploys-with-github-actions.md)
1. [Setting App Secrets](./docs/secrets-catalog.md)

## Applictions

Application documentation is located with its deployment configuration in the `./k8s/*` directories. Application source code is located in the `./apps/*` directories.

- [MQTT](./k8s/mqtt/README.md)
- [Home Assistant](./k8s/home-assistant/README.md)
- [Guest Detection: Captive Portal](./k8s/captive-portal/README.md)

## Automations

See a [list of automations](./docs/automations.md) for regression testing purposes.
