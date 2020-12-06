# My Home Automation

This mono-repo consists of several applications and services I use to create my home automation.

My home automation and, all related services, run in a local Kubernetes cluster. I have automated the provisioning of the cluster, so tearing down or spinning one back up is fairly straight forward. See the [kubernetes cluster setup page](./docs/kubernetes-cluster-setup.md) for more information.

## Spin Up a New Environment

1. [Install and provision kubernetes cluster](./docs/kubernetes-cluster-setup.md)
   - [Kubernetes cluster default features; what is installed?](./docs/kubernetes-cluster-features.md)
2. [Install required services](./docs/install-required-services.md)
