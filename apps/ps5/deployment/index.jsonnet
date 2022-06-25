local secrets = import '../../../apps/secrets/dist/secrets.jsonnet';
local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), '', '80')
                   + lib.deployment.withEnvVars(0, [
                     { name: 'NODE_ENV', value: 'production' },
                     { name: 'DEBUG', value: '@ha/*' },
                     { name: 'MQTT_HOST', value: 'mqtt' },
                     { name: 'MQTT_PORT', value: '1883' },
                   ])
                   + lib.deployment.withHostNetwork()
                   + lib.deployment.withInitContainer('mqtt-is-ready', std.extVar('registryHostname') + '/mqtt-client:latest', { env: [secrets['mqtt/username'], secrets['mqtt/password']], command: ['sh'], args: ['-c', 'timeout 10 sub -h mqtt -t "\\$SYS/#" -C 1 -u $MQTT_USERNAME -P $MQTT_PASSWORD | grep -v Error || exit 1'] })
                   + lib.deployment.withInitContainer('home-assistant-is-ready', 'curlimages/curl:latest', { command: ['sh'], args: ['-c', "timeout 10 curl --fail --insecure --silent --output /dev/null --write-out 'HTTP Code %{http_code}' 'https://ha.smith-simms.family' || exit 1"] })
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('ps5-credentials', '/root/.config/playactor',))
                   + lib.deployment.withSecretVolume('ps5-credentials', 'ps5-credentials-json', 511, [{ key: 'secret-value', path: 'credentials.json' }]);

std.objectValues(deployment)
