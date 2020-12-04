source .secrets/install_k8s.vars.sh
ANSIBLE_CONFIG=ansible/ansible.cfg

ansible-playbook ansible/k8s/reset_k8s.yml -i ansible/hosts --extra-vars "ansible_become_pass='$MACHINE_PASSWORD'"
rm -f ansible/k8s/playbooks/kubernetes_join_command