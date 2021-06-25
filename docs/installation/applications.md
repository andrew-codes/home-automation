# Install Application(s)

**First run `yarn initialize-secrets --ignore @ha/docker-registry --ignore @ha/pihole --ignore @ha/openvpn-as --ignore @ha/lets-encrypt --ignore @ha/github-action-runners --ignore @ha/inlets --ignore @ha/k8s --ignore @ha/vault --ignore @ha/velero` and fill in all relevant secrets in the Vault UI.**

Applications are narrowly focused micro-services. For this reason, often times they may depend on other applications. To ensure an application is built, imaged, and has its secrets populated for deployment, the following is the general rule of thumb to deploy one:

> An application packages is named `${NAME}-app` where as the deployment package is named `${NAME}`.

1. `yarn compile --scope @ha/${APP_NAME}-app` will compile all dependencies of the application and then the application itself.
1. `yarn image/push --scope @ha/${APP_NAME}-app` will create Docker images of this application and all applications it depends on.
1. Fill in all new secrets found in the Vault UI.
1. `yarn deploy --scope @ha/${APP_NAME}` will deploy the application and any other required applications.

## External Facing Applications

> This assumes the application is deployed and working internally.

1. `yarn ingress/stage --scope @ha/${APP_NAME}` to create a stage SSL (via Let's Encrypt) and publicly expose via an Inlet secure tunnel.
1. Point your domain/sub-domain to the Inlet's IP found in Azure.
1. Validate the service/application is available on your domain/sub-domain over HTTPS (with a stage cert).
1. `yarn ingress/prod --scope @ha/${APP_NAME}` will create a production cert.
   > Due to rate limits imposed by Let's Encrypt, it is **not** advised to do this until the stage cert is accessible and validated.
