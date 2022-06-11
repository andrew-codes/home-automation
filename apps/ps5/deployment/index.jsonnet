local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.23/main.libsonnet';

lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVars('externalPort'), 8123) + lib.deployment.withEnvVars(0, [
  { name: 'NODE_ENV', value: 'production' },
  { name: 'DEBUG', value: '' },
  { name: 'MQTT_HOST', value: 'mqtt' },
  { name: 'MQTT_PORT', value: '1883' },
])
+ lib.deployment.withHostNetwork()
+ lib.deployment.withInitContainer('mqtt-is-ready', std.extVar('registryHostname') + 'mqtt-client:latest', { command: 'sh', args: ['-c', 'timeout 10 sub -h mqtt -t "$SYS/#" -C 1 | grep -v Error || exit 1'] })
+ lib.deployment.withInitContainer('home-assistant-is-ready', 'curlimages/curl:latest', { command: 'sh', args: ['-c', "timeout 10 curl --fail --insecure --silent --output /dev/null --write-out 'HTTP Code %{http_code}' 'https://ha.smith-simms.family' || exit 1"] })
+ lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('ps5-credentials', '/root/.config/playactor',))
+ lib.deployment.withSecretVolume('ps5-credentials', 'ps5-credentials', '0777', [{ key: 'secret-value', path: 'credentials.json' }])
