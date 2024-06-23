local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.29/main.libsonnet';

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVar('port'), '3001')
                   + lib.deployment.withEnvVars(0, [
                     { name: 'UPTIME_KUMA_DISABLE_FRAME_SAMEORIGIN', value: '1' },
                   ])
                   + lib.deployment.withPersistentVolume('uptime-kuma')
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('uptime-kuma', '/app/data',));

local volume = k.core.v1.persistentVolume.new('uptime-kuma-pv')
               + k.core.v1.persistentVolume.metadata.withLabels({ type: 'local' })
               + k.core.v1.persistentVolume.spec.withAccessModes('ReadWriteMany')
               + k.core.v1.persistentVolume.spec.withStorageClassName('manual')
               + k.core.v1.persistentVolume.spec.withCapacity({ storage: '10Gi' })
               + k.core.v1.persistentVolume.spec.hostPath.withPath('/mnt/data/uptime-kuma')
;
local volumeClaim = k.core.v1.persistentVolumeClaim.new('uptime-kuma-pvc')
                    + k.core.v1.persistentVolumeClaim.spec.withAccessModes('ReadWriteMany')
                    + k.core.v1.persistentVolumeClaim.spec.withStorageClassName('manual')
                    + k.core.v1.persistentVolumeClaim.spec.resources.withRequests({ storage: '10Gi' })
;

[]
+ [volume, volumeClaim]
+ std.objectValues(deployment)
