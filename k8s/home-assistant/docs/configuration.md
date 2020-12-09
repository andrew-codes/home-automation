# Home Assistant Configuration

The Home Assistant [configuration directory](https://www.home-assistant.io/docs/configuration/) is located in the `./k8s/home-assistant/home-assistant-config` directory. The configuration files are committed and versioned in git.

A recommended, basic configuration to start with is:

```yaml
# Configure a default setup of Home Assistant (frontend, api, etc)
default_config:
browser:
api:

# # Uncomment this if you are using SSL/TLS, running in Docker container, etc.
#
discovery:
ios:

recorder:
  purge_keep_days: 7

logger:
  default: info

homeassistant:
  time_zone: !secrets time_zone
  latitude: !secret latitude
  longitude: !secret longitude
  unit_system: !secret unit_system
  packages: !include_dir_merge_named packages
frontend:
  themes: !include_dir_merge_named themes
```

## Deploying Configuration

Although you can deploy Home Assistant, the configuration directory is not deployed from your local box. Instead, on deployment, it is pulled from your git repository (`$HOME_ASSISTANT_REPO_URL`).

## Next Steps

> Don't forget to add [configuration secrets](https://www.home-assistant.io/docs/configuration/secrets/).

Update your configuration, commit and push to master. The changes should be automatically deployed by the [local GitHub action runner](./../../../docs/automate-deploys-with-github-actions.md).
