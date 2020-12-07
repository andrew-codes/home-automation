source secrets.sh
./set_secrets.sh
ANSIBLE_CONFIG=./ansible/ansible.cfg

ansible-playbook "$1" -i ansible/hosts.yml --extra-vars "ansible_become_pass='$MACHINE_PASSWORD'"

rm -rf ansible/k8s/.secrets
