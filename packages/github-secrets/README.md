# Setting GitHub Secrets

The local GitHub action runners used to build and deploy the automation require a subset of repository secrets to be stored in GitHub. This package provides a CLI interface to easily add secrets via the GitHub API.

This package is used by `./set_secrets.sh` to automatically add all required repository secrets to GitHub.

## Usage

Requires the $GITHUB_RUNNER_TOKEN environment variable to be set.

```bash
$OWNER="andrew-codes"
$REPO="home-automation"
$SECRET_NAME="DOCKER_REGISTRY_DOMAIN"

yarn seal-github-secret $OWNER $REPO $SECRET_NAME $DOCKER_REGISTRY_DOMAIN
```
