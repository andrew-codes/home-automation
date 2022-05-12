#!/usr/bin/env bash

echo "Will Start on http://localhost:8123"

docker pull docker-registry:5000/home-assistant:latest
telepresence connect

# if [ -f intercept.env ]; then
#     export $(cat intercept.env | grep HASS_TOKEN)
#     yarn chokidar "src/**/*.yaml" --debounce 4000 -c "bash -c 'curl -X POST -H \"Authorization: Bearer $HASS_TOKEN\" -H \"Content-Type: application/json\" \"http://localhost:8123/api/services/automation/reload\" | true'" &
# fi

telepresence intercept "home-assistant" --service home-assistant-api --env-file intercept.env --port 8123:8123 --mount ./.tmp/config -- /bin/bash -c 'docker run --name home-assistant --rm -t $(cat intercept.env | sed -n "/^[^\t]/s/=.*//p" | sed "/^$/d" | sed "s/^/-e /g" | tr "\n" " ") --env HASS_SERVER="http://localhost:8123" --env "TELEPRESENCE_ROOT=/tmp" -v "$PWD/src:/home-assistant-src" -v "$PWD/.tmp/config:/tmp" -p "8123:8123" "docker-registry:5000/home-assistant:latest"'
