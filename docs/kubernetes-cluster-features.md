# Kubernetes Cluster

> For installation instructions, see the [kubernetes installation doc](./kubernetes-cluster-setup.md).

## Default Provisioning

- Docker
- Kubernetes and [Calico](https://docs.projectcalico.org/about/about-calico) networking
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
