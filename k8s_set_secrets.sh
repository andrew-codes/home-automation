mkdir -p .secrets && echo "export MACHINE_PASSWORD='$MACHINE_PASSWORD'" > .secrets/install_k8s.vars.sh
mkdir -p ansible/k8s/.secrets
cat > ansible/k8s/.secrets/setup_k8s.yml <<EOL
---
digitalocean_token: "$DIGITALOCEAN_TOKEN"

docker_registry_username: "$DOCKER_REGISTRY_USERNAME "
docker_registry_password: "$DOCKER_REGISTRY_PASSWORD"
docker_registry_ingress_email: "$DOCKER_REGISTRY_INGRESS_EMAIL"
docker_registry_ingress_domain: "$DOCKER_REGISTRY_INGRESS_DOMAIN"

pod_network_cidr: "$POD_NETWORK_CIDR"
EOL
mkdir -p k8s/setup/.secrets
cat > k8s/setup/.secrets/inlets-pro.license <<EOL
$INLETS_PRO_LICENSE
EOL