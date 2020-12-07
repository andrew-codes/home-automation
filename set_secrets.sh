#!/usr/bin/env bash

mkdir -p ansible/k8s/.secrets
cat >ansible/k8s/.secrets/setup_k8s.yml <<EOL
---
digitalocean_token: "$DIGITALOCEAN_TOKEN"
backup_bucket: "$BACKUP_BUCKET"
backup_uri: "$BACKUP_URI"
inlets_pro_license: "$INLETS_PRO_LICENSE"
pod_network_cidr: "$POD_NETWORK_CIDR"
EOL

cat >ansible/k8s/.secrets/inlets-pro.license <<EOL
$INLETS_PRO_LICENSE
EOL

mkdir -p k8s/lets-encrypt/.secrets
cat >k8s/lets-encrypt/.secrets/issuers.yml <<EOL
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-staging
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: $EMAIL
    privateKeySecretRef:
      name: letsencrypt-staging
    solvers:
      - selector:
        http01:
          ingress:
            class: nginx

---
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: $EMAIL
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - selector:
        http01:
          ingress:
            class: nginx
EOL

cat >ansible/k8s/.secrets/backup-cloud-credentials.ini <<EOL
[default]
aws_access_key_id=$SPACES_ACCESS_KEY
aws_secret_access_key=$SPACES_ACCESS_SECRET_KEY
EOL

cat >ansible/k8s/.secrets/k8s-digitalocean-secret-token.yml <<EOL
---
apiVersion: v1
kind: Secret
stringData:
  digitalocean_token: $DIGITALOCEAN_TOKEN
type: Opaque
EOL
