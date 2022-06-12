local secrets = import '../../../apps/secrets/dist/secrets.jsonnet';
local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVar('port'), '5000')
                   + lib.deployment.withEnvVars(0, [
                     { name: 'DEBUG', value: '' },
                     { name: 'MQTT_HOST', value: 'mqtt' },
                     { name: 'MQTT_PORT', value: '1883' },
                   ])
                   + lib.deployment.withPort(0, std.extVar('name'), 'rtmp', 1935, std.extVar('external_rmtp_port'))
                   + lib.deployment.withPersistentVolume('frigate-media')
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('frigate-media', '/media/frigate',))
                   + lib.deployment.withInitContainer('mqtt-is-ready', std.extVar('registryHostname') + '/mqtt-client:latest', { env: [secrets['mqtt/username'], secrets['mqtt/password']], command: ['sh'], args: ['-c', 'timeout 10 sub -h mqtt -t "\\$SYS/#" -C 1 -u $MQTT_USERNAME -P $MQTT_PASSWORD | grep -v Error || exit 1'] })
                   + lib.deployment.withSecurityContext(0, { privileged: true, allowPrivilegeEscalation: true },);

local volume = lib.volume.persistentVolume.new('frigate-media', '300Gi', '/mnt/data/frigate');

volume + std.objectValues(deployment)
