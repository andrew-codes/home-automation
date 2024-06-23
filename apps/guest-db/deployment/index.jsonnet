local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.29/main.libsonnet';

local deployment = lib.deployment.new('guest-db', std.extVar('image'), '', '', '27017')
                   + lib.deployment.withPersistentVolume('guest-db')
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('guest-db', '/data/db',))
                   + lib.deployment.withAffinity({
                     nodeAffinity: {
                       requiredDuringSchedulingIgnoredDuringExecution: {
                         nodeSelectorTerms: [
                           { matchExpressions: [{ key: 'kubernetes.io/hostname', operator: 'In', values: ['k8s-main'] }] },
                         ],
                       },
                     },
                   },)
;

local guestDbVolume = [
  k.core.v1.persistentVolume.new('guest-db-pv')
  + k.core.v1.persistentVolume.metadata.withLabels({ type: 'local' })
  + k.core.v1.persistentVolume.spec.withAccessModes('ReadWriteMany')
  + k.core.v1.persistentVolume.spec.withStorageClassName('manual')
  + k.core.v1.persistentVolume.spec.withCapacity({ storage: '5Gi' })
  + k.core.v1.persistentVolume.spec.hostPath.withPath('/mnt/data/guest-db'),

  k.core.v1.persistentVolumeClaim.new('guest-db-pvc')
  + k.core.v1.persistentVolumeClaim.spec.withAccessModes('ReadWriteMany')
  + k.core.v1.persistentVolumeClaim.spec.withStorageClassName('manual')
  + k.core.v1.persistentVolumeClaim.spec.resources.withRequests({ storage: '5Gi' }),
]
;

std.objectValues(deployment) + guestDbVolume
