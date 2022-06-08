local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.23/main.libsonnet';

lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVar('port'), 5000)
+ lib.deployment.withEnvVars(0, [
  { name: 'DEBUG', value: '' },
  { name: 'MQTT_HOST', value: 'mqtt' },
  { name: 'MQTT_PORT', value: '1883' },
])
+ lib.deployment.withPort(0, 'rtmp', 1935, std.extVar('external_rmtp_port'))
+ lib.deployment.withPersistentVolume('frigate', '300Gi', '/mnt/data/frigate')
+ lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('frigate', '/media/frigate',))
+ lib.deployment.withInitContainer('mqtt-is-ready', std.extVar('registryHostname') + 'mqtt-client:latest', 'sh', ['-c', 'timeout 10 sub -h mqtt -t "$SYS/#" -C 1 | grep -v Error || exit 1'])
+ lib.deployment.withSecurityContext({ priviliged: true, allowPrivilegeEscalation: true },)
