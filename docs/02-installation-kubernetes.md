# Installing Kubernetes

Kubernetes will be installed and configured on the HOST machine (Ubuntu Server VM). The automated process leverages Ansible.

## Preparing Ansible

1. Update `./ansible/hosts.yml` with the IP addresses of your machines
   - Add a machine's IP address to `mains` group for master nodes
   - Add a machine's IP address to `workers` for secondary nodes
   - Add a single primary node's IP address as the `cluster_primary`

```yml
all:
  vars:
    ansible_user: hl # user from ubuntu machine setup
  children:
    cluster_primary:
      hosts:
        192.168.1.100: # any primary node; but only one
    mains:
      hosts:
        192.168.1.100: # primary node
    workers:
      hosts:
        192.168.1.110: # worker node
        192.168.1.111: # worker node
```

## Required Secrets

Fill in the secrets found in `secrets.sh` for the "# Required for Initial Provisioning" section and then execute:

```bash
./set_initial_secrets.sh
```

> This command will apply secrets for use with Ansible to provision Kubernetes nodes.

## Provision Kubernetes

> This assumes you have pulled your SSH key from GitHub, and it exists on your developer machine.

```bash
./ansible.sh ansible/k8s/all.yml
```

## Troubleshooting

If you want to reset the Kubernetes cluster, you can run the following (AFTER first running the above at least once):

> This will **not** automatically re-init Kubernetes.

```bash
./ansible.sh ansible/k8s/reset.yml

# Then re-initialize and install deployments.
# ./ansible.sh ansible/k8s/all.yml
```

# Next

[Deploy a Docker registry](./03-installation-docker-registry) to hold all the container images for home automation.
