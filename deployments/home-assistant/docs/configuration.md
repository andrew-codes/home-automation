# Home Assistant Configuration

The Home Assistant [configuration directory](https://www.home-assistant.io/docs/configuration/) is located in the `./apps/home-assistant/src` directory. The configuration files are committed and versioned in git.

> A recommended, basic configuration to start with is:

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
