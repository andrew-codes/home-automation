mkdir -p ansible/k8s/.secrets
mkdir -p k8s/setup/.secrets
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

cat >k8s/setup/.secrets/lets-encrypt-cert-issuers.yml <<EOL
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

mkdir -p k8s/docker-registry/.secrets
cat >k8s/docker-registry/.secrets/ingress-staging.yml <<EOL
---
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  annotations:
    nginx.ingress.kubernetes.io/proxy-body-size: "0"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "600"
    kubernetes.io/tls-acme: "true"
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-staging
  name: docker-registry
  namespace: docker-registry
spec:
  tls:
    - hosts:
        - $DOCKER_REGISTRY_DOMAIN
      secretName: docker-tls
  rules:
    - host: $DOCKER_REGISTRY_DOMAIN
      http:
        paths:
          - backend:
              serviceName: docker-registry
              servicePort: 5000
            path: /
EOL

cat >k8s/docker-registry/.secrets/ingress-production.yml <<EOL
---
apiVersion: networking.k8s.io/v1beta1
kind: Ingress
metadata:
  annotations:
    nginx.ingress.kubernetes.io/proxy-body-size: "0"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "600"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "600"
    kubernetes.io/tls-acme: "true"
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
  name: docker-registry
  namespace: docker-registry
spec:
  tls:
    - hosts:
        - $DOCKER_REGISTRY_DOMAIN
      secretName: docker-tls
  rules:
    - host: $DOCKER_REGISTRY_DOMAIN
      http:
        paths:
          - backend:
              serviceName: docker-registry
              servicePort: 5000
            path: /
EOL
