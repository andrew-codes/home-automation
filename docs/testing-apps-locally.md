# Testing Apps Locally

When developing applications, it is useful to have them running locally to test. However, any given app will likely depend on or communicate with another app/service within the cluster. For example, for the GraphQL API app to run, it needs an instance of Home Assistant, an MQTT connection, and an Unifi USG connection. Although we could attempt to run all the required services locally as well, this is not a scalable strategy.

Instead, we can run an application locally and have it think it is running in the real cluster. All communication with other cluster apps/services will be proxied to the real cluster. This means that not only will apps run locally, but you will be testing with actual, real data, too.

## Running Applications Locally

> This assumes, and **only works**, with a working **deployed cluster**. Be sure to follow the [installation guide](./installation-guide.md) first.

1. To run an app locally, you must build the application development images. You can do this via `yarn image/local`.
   > `yarn image/local` does not accept a `--scope` parameter.
1. Run the start of the respective **app package**; e.g., `yarn start --scope @ha/captive-portal-app`
1. See the console output for connecting to the service locally. In this example, `http://localhost:8081/`.
1. Editing an app's code will auto-restart the application

## Clean up

Once done developing, run `yarn start/cleanup` to clean up telepresence.
