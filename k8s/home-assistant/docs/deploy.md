# Home Assistant Secrets

## Deployment Secrets

In order to deploy Home Assistant, you will need the following secrets:

1. Git clone repository URL; e.g. `git@github.com:andrew-codes/home-automation.git`
1. A **passphrasesless** [private SSH key](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent#generating-a-new-ssh-key) that has access/been [added to GitHub](https://docs.github.com/en/free-pro-team@latest/github/authenticating-to-github/adding-a-new-ssh-key-to-your-github-account).
1. The fully qualified domain address for the instance
   > This domain should also point to your `$INLETS_IP` address.
1. The username and password to the [dynamic DNS from Google Domains](https://support.google.com/domains/answer/6147083?hl=en)
   - I am using Google Domains to manage my dynamic DNS entries.
   - Leave blank if you are using something else and want to manually update the dynamic DNS entry with your DNS provider.

Copy the following settings with their secret values to your `.secrets.sh` file.

```bash
# Home Assistant
export HOME_ASSISTANT_REPO_URL=""
export HOME_ASSISTANT_ID_RSA=$(
    cat <<EOL
-----BEGIN OPENSSH PRIVATE KEY-----
-----END OPENSSH PRIVATE KEY-----
EOL
)
export HOME_ASSISTANT_DOMAIN=""
export HOME_ASSISTANT_DNS_USERNAME=""
export HOME_ASSISTANT_DNS_PASSWORD=""
```

## Seal Secrets

Run the following and commit the resultant files to the repo.

```bash
yarn seal --scope @ha/home-assistant --stream
```

## Deploy

This will deploy Home Assistant to the Kubernetes cluster.

```bash
yarn deploy --scope @ha/home-assistant --stream
```

## Login for the First Time

Visit `http://$CLUSTER_IP:8123` to signup as the main user.

> DO THIS BEFORE MAKING THE SITE PUBLICLY AVAILABLE!

## Publicly Accessible

### Stage (Testing)

Once you have your `$HOME_ASSISTANT_DOMAIN` DNS entry pointing to your `$INLET_IP` address, you are ready to securely make the site publicly available.

Start by running the following. This will use the staging environment of let's encrypt; which has relaxed API rate limits for testing purposes.

```bash
yarn ingress/stage --scope @ha/home-assistant --stream

# Wait until this outputs as READY: true
kubectl get certs -n home-automation
```

### Production

Once `kubectl get certs -n home-automation` indicates that the state is ready (`True`), then you can proceed to the next step.

```bash
yarn ingress/prod --scope @ha/home-assistant --stream

# Wait until this outputs as READY: true
kubectl get certs -n home-automation
```

> Visit the site at: `https://${HOME_ASSISTANT_DOMAIN}`.

> Note that the SSL certificate is recognized as valid by the browser.
