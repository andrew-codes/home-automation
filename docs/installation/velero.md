# Velero

Velero will create rolling back ups of the Kubernetes cluster to Azure Storage.

## Obtaining Necessary Secrets

This will aid you in creating the necessary Azure resources in which to use as secrets for Velero.

1. [Setup](https://github.com/vmware-tanzu/velero-plugin-for-microsoft-azure#setup)
1. [Setup Azure storage account and blob container](https://github.com/vmware-tanzu/velero-plugin-for-microsoft-azure#setup-azure-storage-account-and-blob-container)
1. [Create Azure Storage account and blob container](https://github.com/vmware-tanzu/velero-plugin-for-microsoft-azure#create-azure-storage-account-and-blob-container)
1. [Get resource group for your disks](https://github.com/vmware-tanzu/velero-plugin-for-microsoft-azure#create-azure-storage-account-and-blob-container)
1. [Set permissions for Velero - Service Principal option](https://github.com/vmware-tanzu/velero-plugin-for-microsoft-azure#option-1-create-service-principal)

## Secrets

```bash
yarn initialize-secrets --scope @ha/velero
```

> Set secrets via the Vault UI.

## Deploy

```bash
yarn deploy --scope @ha/velero
```
