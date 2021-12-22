# Azure Key Vault

[Azure Key Vault](https://azure.microsoft.com/en-us/services/key-vault/) is what is used to manage secrets for these applications.

## Deploy Key Vault to Azure

Update `AZURE_*` values in `./.provision-vars.env` file.
Update `./secrets.env` with `AZURE_SERVICE_PRINCIPAL_NAME` values and then run:

```bash
az login # follow the prompts to login

./scripts/bin/create-service-principal.sh
# This will output an appId, password, and tenant. Save these in `./secrets.env`.
```

Next, run:

```bash
yarn deploy --scope @ha/azure-key-vault
```

## Save Vault Keys

Once deployed, ensure the contents of the file `./deployments/vault/.secrets/vault_init.json` is kept in a secure location.

## Sign into Vault

Navigate to http://{PROD_VAULT_IP}:8200 in a browser. Use any 3 of the 5 keys found in `./deployments/vault/.secrets/vault_init.json` to unseal the vault and then login with the root token (also found in `./deployments/vault/.secrets/vault_init.json`).

Copy the root token and save it to your `.secrets.env` file. Also ensure the VAULT_ADDR secret is pointing to your vault URL and port.

## Additional Vault Configuration

Sign into the Vault UI. Add the following to the default policy:

```hcl
path "kv/*" {
    capabilities = ["create", "read", "update", "delete", "list"]
}
```

## kv Secrets engine

Next, create a `kv` v2 secrets engine. This is where all the secrets will be stored.
