local secrets = import '../../../apps/secrets/dist/secrets.jsonnet';
local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.29/main.libsonnet';

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), '', '8080')
                   + lib.deployment.withEnvVars(0, [
                     { name: 'MQTT_HOST', value: 'mqtt' },
                     { name: 'MQTT_PORT', value: '1883' },
                     { name: 'DEVICE_CHECK_INTERVAL', value: '5000' },
                     { name: 'DEVICE_DISCOVERY_INTERVAL', value: '60000' },
                     { name: 'ACCOUNT_CHECK_INTERVAL', value: '5000' },
                     { name: 'FRONTEND_PORT', value: '8645' },
                     { name: 'CREDENTIAL_STORAGE_PATH', value: '/config/credentials.json' },
                     { name: 'DEBUG', value: '@ha:ps5:*' },
                   ])
                   + lib.deployment.withContainerAugmentation(0, {
                     command: ['sh'],
                     args: ['-c', '/app/run-standalone.sh'],
                   })
                   + lib.deployment.withHostNetwork()
                   + lib.deployment.withInitContainer('mqtt-is-ready', std.extVar('registryHostname') + '/mqtt-client:latest', { env: [secrets['mqtt/username'], secrets['mqtt/password']], command: ['sh'], args: ['-c', 'timeout 10 sub -h mqtt -t "\\$SYS/#" -C 1 -u $MQTT_USERNAME -P $MQTT_PASSWORD | grep -v Error || exit 1'] })
                   + lib.deployment.withInitContainer('home-assistant-is-ready', 'curlimages/curl:latest', { command: ['sh'], args: ['-c', "timeout 10 curl --fail --insecure --silent --output /dev/null --write-out 'HTTP Code %{http_code}' 'https://ha.smith-simms.family' || exit 1"] })
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('ps5-credentials', '/config/credentials.json',))
                   + lib.deployment.withSecretVolume('ps5-credentials', 'ps5-credentials-json', 511, [{ key: 'secret-value', path: 'credentials.json' }])
;

std.objectValues(deployment)
