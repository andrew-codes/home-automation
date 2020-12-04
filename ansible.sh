source .secrets/install_k8s.vars.sh
ANSIBLE_CONFIG=./ansible/ansible.cfg

ansible-playbook "$1" -i ansible/hosts.yml --extra-vars "ansible_become_pass='$MACHINE_PASSWORD'"