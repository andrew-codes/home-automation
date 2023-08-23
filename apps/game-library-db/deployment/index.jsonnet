local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local deployment = lib.deployment.new('game-library-db', std.extVar('image'), '', '', '27017')
                   + lib.deployment.withPersistentVolume('game-library-db')
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('game-library-db', '/data/db',));

local gameLibraryDbVolume = [
          k.core.v1.persistentVolume.new('game-library-pv')
          + k.core.v1.persistentVolume.metadata.withLabels({ type: 'local' })
          + k.core.v1.persistentVolume.spec.withAccessModes('ReadWriteMany')
          + k.core.v1.persistentVolume.spec.withStorageClassName('manual')
          + k.core.v1.persistentVolume.spec.withCapacity({ storage: '60Gi' })
          + k.core.v1.persistentVolume.spec.hostPath.withPath("/mnt/data/game-library-db"),

          k.core.v1.persistentVolumeClaim.new('game-library-pvc')
          + k.core.v1.persistentVolumeClaim.spec.withAccessModes('ReadWriteMany')
          + k.core.v1.persistentVolumeClaim.spec.withStorageClassName('manual')
          + k.core.v1.persistentVolumeClaim.spec.resources.withRequests({ storage: '60Gi' }),
        ]
;

gameLibraryDbVolume + std.objectValues(deployment)
