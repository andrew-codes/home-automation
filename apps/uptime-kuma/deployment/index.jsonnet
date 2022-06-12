local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVar('port'), '3001')
                   + lib.deployment.withEnvVars(0, [
                     { name: 'UPTIME_KUMA_DISABLE_FRAME_SAMEORIGIN', value: '1' },
                   ])
                   + lib.deployment.withPersistentVolume('uptime-kuma')
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('uptime-kuma', '/app/data',));

local volume = lib.volume.persistentVolume.new('uptime-kuma', '10Gi', '/mnt/data/uptime-kuma');

volume + std.objectValues(deployment)
