# Kubernetes Cluster

> For installation instructions, see the [kubernetes installation doc](./docs/kubernetes-cluster-setup.md).

## What is Provisioned by Default?

- Docker
- Kubernetes and [Calico](https://docs.projectcalico.org/about/about-calico) networking
- Kubernetes off-site backups to Digital Ocean Spaces; via [velero](https://velero.io/)
- Automatic encryption of secrets via [sealed secrets](https://engineering.bitnami.com/articles/sealed-secrets.html)
- [Kubernetes Dashboard](https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/)
- nginx reverse proxy to services; via [nginx ingress](https://kubernetes.github.io/ingress-nginx/)
- Automatic, free SSL certificates via [let's encrypt](https://letsencrypt.org/)
- Secure TCP tunneling enabled for select services; via [inlets and operator](https://inlets.dev/)

## View the Dashboard

```bash
yarn dashboard

# Copy the output token
```

Then visit the local [dashboard web UI](http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#/login)

## Backup and Restore

This will demonstrate backing up and then restoring the home-automation namespace in the kubernetes cluster.

> Ensure you have already installed [velero CLI](https://velero.io/docs/v1.5/basic-install/); see their [installation guide](https://velero.io/docs/v1.5/basic-install/) for more details.

1. Create the backup: `velero backup create home-automation-namespace --include-namespaces home-automation`
1. Delete the namespace: `kubectl delete ns home-automation`
1. Ensure all namespace volumes/claims are deleted, too.
1. Restore via: `velero restore create --from-backup home-automation-namespace`
