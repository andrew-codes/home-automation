# Pihole

## Provision Pihole

Pihole will be used as a DNS server to enable configuring the host `docker-registry` to point to the correct IP. Provision the container via:

```bash
yarn provision pihole prod.env
```

## Deploy Pihole

Currently, to deploy pihole, you will need to SSH into the provisioned container from above and execute the installation command. This is due to it requiring user input during installation.

```bash
ssh root@{PROD_PIHOLE_IP}
apt-get update --allow-releaseinfo-change
apt-get install -y curl dnsmasq
curl -sSL https://install.pi-hole.net | bash /dev/stdin
```

## Create PiHole Password Secret

First initialize the secret via `yarn initialize-secrets --scope @ha/pihole`. This will create a blank secret in vault at `kv/pihole password`.

> **DO NOT FORGET** to set secrets via the Vault UI.

Update `./deployments/pihole/hosts.yml` with `{PROD_PIHOLE_IP}`, then run `yarn deploy --scope @ha/pihole` to set the password in PiHole.

## Set Pihole as your network's DNS

Configure your router to use `{PROD_PIHOLE_IP}` as the only DNS server when handing out IP leases.
