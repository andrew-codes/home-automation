local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.23/main.libsonnet';

lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets')) + lib.deployment.withEnvVars(0, [
  { name: 'DEBUG', value: '' },
  { name: 'MQTT_HOST', value: 'mqtt' },
  { name: 'MQTT_PORT', value: '1883' },
])
+ lib.deployment.withInitContainer('mqtt-is-ready', std.extVar('registryHostname') + 'mqtt-client:latest', { command: 'sh', args: ['-c', 'timeout 10 sub -h mqtt -t "$SYS/#" -C 1 | grep -v Error || exit 1'] })