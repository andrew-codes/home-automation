# Vault

## Provision Vault

[Vault](https://www.vaultproject.io/) is what is used to manage secrets for these applications. It may be provisioned and deployed via the following:

```sh
yarn provision vault prod.env
```

## Deploy Vault

```bash
yarn deploy --scope @ha/vault
```

## Save Vault Keys

Once deployed, ensure the contents of the file `./deployments/vault/.secrets/vault_init.json` is kept in a secure location.

## Sign into Vault

Navigate to http://192.168.3.3:8200 in a browser. Use any 3 of the 5 keys found in `./deployments/vault/.secrets/vault_init.json` to unseal the vault and then login with the root token (also found in `./deployments/vault/.secrets/vault_init.json`).

Once signed in, enable the userpass authentication method, found under "Access", and create a user named automation with a secure password. Sign out and sign in with the automation user.

Finally, create a token for the automation user and save it to your `.secrets.env` file. Also ensure the VAULT_ADDR secret is pointing to your vault URL and port.
