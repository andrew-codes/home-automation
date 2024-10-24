if [ -f /workspaces/home-automation/.secrets.env ]; then
    set -o allexport
    source /workspaces/home-automation/.secrets.env
    set +o allexport
    echo -e "$(op read op://$ONEPASSWORD_VAULT_ID/s6mbwk4ppivpoyjgmzba3nsyu4/secret-value)" >~/.kube/config
fi
