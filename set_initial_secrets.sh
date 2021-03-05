#!/usr/bin/env bash

source secrets.sh

mkdir -p ansible/k8s/.secrets
cat >ansible/k8s/.secrets/setup_k8s.yml <<EOL
---
digitalocean_token: "$DIGITALOCEAN_TOKEN"
backup_bucket: "$BACKUP_BUCKET"
backup_uri: "$BACKUP_URI"
inlets_pro_license: "$INLETS_PRO_LICENSE"
docker_registry_domain: "$DOCKER_REGISTRY_DOMAIN"
EOL

cat >ansible/k8s/.secrets/inlets-pro.license <<EOL
$INLETS_PRO_LICENSE
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
