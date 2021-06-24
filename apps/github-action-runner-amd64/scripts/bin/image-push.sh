#!/usr/bin/env bash

docker run -v $PWD:/workspace gcr.io/kaniko-project/executor:latest --destination "docker-registry:5000/github-action-runner:latest" --dockerfile /workspace/Dockerfile --context dir:///workspace/ --insecure
