mkdir -p .secrets && echo "export MACHINE_PASSWORD='$MACHINE_PASSWORD'" > .secrets/install_k8s.vars.sh
mkdir -p ansible/k8s/.secrets
cat > ansible/k8s/.secrets/setup_k8s.yml <<EOL
---
digitalocean_token: "$DIGITALOCEAN_TOKEN"

docker_registry_username: "$DOCKER_REGISTRY_USERNAME "
docker_registry_password: "$DOCKER_REGISTRY_PASSWORD"
docker_registry_ingress_email: "$EMAIL"
docker_registry_ingress_domain: "$DOCKER_REGISTRY_INGRESS_DOMAIN"

inlets_pro_license: "$INLETS_PRO_LICENSE"

pod_network_cidr: "$POD_NETWORK_CIDR"
EOL
mkdir -p k8s/setup/.secrets
cat > k8s/setup/.secrets/inlets-pro.license <<EOL
$INLETS_PRO_LICENSE
EOL

cat > k8s/setup/.secrets/lets-encrypt-cert-issuers.yml << EOL
apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
  name: letsencrypt-staging
  namespace: default
spec:
  acme:
    server: https://acme-staging-v02.api.letsencrypt.org/directory
    email: $EMAIL
    privateKeySecretRef:
      name: letsencrypt-staging
    solvers:
      - selector: {}
        http01:
          ingress:
            class: nginx

---
apiVersion: cert-manager.io/v1
kind: Issuer
metadata:
  name: letsencrypt-prod
  namespace: default
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: $EMAIL
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - selector: {}
        http01:
          ingress:
            class: nginx
EOL

cat > k8s/setup/.secrets/backup-cloud-credentials.ini << EOL
[default]
aws_access_key_id=$SPACES_ACCESS_KEY
aws_secret_access_key=$SPACES_ACCESS_SECRET_KEY
EOL

cat > k8s/setup/.secrets/k8s-digitalocean-secret-token.yml << EOL
---
apiVersion: v1
kind: Secret
stringData:
  digitalocean_token: $DIGITALOCEAN_TOKEN
type: Opaque
EOL

cat > k8s/setup/.secrets/k8s-velero-patch-deployment.yml << EOL
---
apiVersion: v1
kind: Deployment
spec:
  template:
    spec:
      containers:
      - args:
        - server
        command:
        - /velero
        env:
        - name: DIGITALOCEAN_TOKEN
          valueFrom:
            secretKeyRef:
              key: digitalocean_token
              name: cloud-credentials
        name: velero
EOL
