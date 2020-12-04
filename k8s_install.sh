source .secrets/install_k8s.vars.sh
ANSIBLE_CONFIG=ansible/ansible.cfg

# mkdir -p k8s/setup/.secrets
# az login
# az ad sp create-for-rbac --sdk-auth --name home-automation > k8s/setup/.secrets/azure_client_credentials.json.tmp

ansible-playbook ansible/k8s/install_k8s.yml -i ansible/hosts --extra-vars "ansible_become_pass='$MACHINE_PASSWORD'"