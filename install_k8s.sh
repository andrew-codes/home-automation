MACHINE_PASSWORD=$(cat .secrets/hl-machine-password)
ANSIBLE_CONFIG=ansible/ansible.cfg

ansible-playbook ansible/k8s/install_k8s.yml -i ansible/hosts --extra-vars "ansible_become_pass='$MACHINE_PASSWORD'"