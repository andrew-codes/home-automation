# Kubernetes Cluster

> For installation instructions, see the [kubernetes installation doc](./installation-guide.md).

## Default Provisioning

- Docker
- Kubernetes and Flannel networking
- Automatic encryption of secrets via [sealed secrets](https://engineering.bitnami.com/articles/sealed-secrets.html)
- Kubernetes Dashboard via [Lens](https://k8slens.dev/)
- nginx reverse proxy to services; via [nginx ingress](https://kubernetes.github.io/ingress-nginx/)
- Automatic, free SSL certificates via [let's encrypt](https://letsencrypt.org/)
- Secure TCP tunneling enabled for select services; via [inlets and operator](https://inlets.dev/)
- Kubernetes cluster backup to Azure storage blob via [Velero](https://velero.io/)
