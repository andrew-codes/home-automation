if [ -f .secrets.env ]; then
    source .secrets.env
    echo -e "$(op read op://$OP_CONNECT_VAULT_ID/s6mbwk4ppivpoyjgmzba3nsyu4/secret-value)" >~/.kube/config
fi
