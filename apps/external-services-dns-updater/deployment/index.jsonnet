local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.23/main.libsonnet';

lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets')) + lib.deployment.withEnvVars(0, [
  { name: 'DEBUG', value: '' },
  { name: 'MQTT_HOST', value: 'mqtt' },
  { name: 'MQTT_PORT', value: '1883' },
  { name: 'GOOGLE_APPLICATION_CREDENTIALS', value: '/.secrets/credentials.json' },
])
+ lib.deployment.withInitContainer('mqtt-is-ready', std.extVar('registryHostname') + '/mqtt-client:latest', 'sh', ['-c', 'timeout 10 sub -h mqtt -t "$SYS/#" -C 1 | grep -v Error || exit 1'],)
+ lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('dns-google-service-account-creds', '/.secrets',))
+ lib.deployment.withSecretVolume('dns-google-service-account-creds', 'dns-google-service-account-creds', '0777', [{ key: 'secret-value', path: 'credentials.json' }])
