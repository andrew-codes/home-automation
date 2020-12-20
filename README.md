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

## Testing Locally

When developing applications, it is useful to have them running locally to test. However, it is very likely that any given app will depend or communicate with another app/service within the cluster. For example, in order for the GraphQL API app to run, it needs an instance of Home Assistant, an MQTT connection, and an Unifi USG connection. Although we could attempt to run all the required services locally as well, this is not a scalable strategy.

Instead, we can run an application locally and have it think it is running in the real cluster. All communication with other cluster apps/services will be proxied to the real cluster. This means that not only will apps run locally, but you will be testing with actual, real data, too.

### Running Applications Locally

> This assumes, and **only works**, with a working **deployed cluster**.

1. To run an app locally, first you must build the application development images. You can do this via `yarn image/local`.
1. Each app has a dedicated start shell script in the root. For example, to run the GraphQL API locally, you can run `./start-graphql-api-locally.sh`
1. See the console output for connecting to the service locally. In this example; http://localhost:8080/altair` to see the GraphQL client
1. Editing an app's code will auto-restart the application

## Automations

See a [list of automations](./docs/automations.md) for regression testing purposes.
