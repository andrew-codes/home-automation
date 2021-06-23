# Provisioning Pihole

Pihole will be used as a DNS server to enable configuring the host `docker-registry` to point to the correct IP. Provision the container via:

```sh
yarn provision pihole prod.env
```

## Deploying Pihole

Currently, to deploy pihole, you will need to SSH into the provisioned container from above and execute the installation command. This is due to it requiring user input during installation.

```
ssh root@192.168.3.1
apt-get update
apt-get install -y curl
curl -sSL https://install.pi-hole.net | bash /dev/stdin
```

## Create PiHole Password Secret

First initialize the secret via `yarn initialize-secrets --scope @ha/pihole`. This will create a blank secret in vault at `cubbyhole/pihole password`. You may either add the value for the password in Vault's UI or via `vault write cubbyhole/pihole password="$PIHOLE_PASSWORD"`.

Finally, run `yarn deploy --scope @ha/pihole` to set the password in PiHole.
