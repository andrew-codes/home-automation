local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local volume1 = k.core.v1.persistentVolume.new('crowdsec-config-pv')
                + k.core.v1.persistentVolume.metadata.withLabels({ type: 'local' })
                + k.core.v1.persistentVolume.spec.withAccessModes('ReadWriteOnce')
                + k.core.v1.persistentVolume.spec.withStorageClassName('manual')
                + k.core.v1.persistentVolume.spec.withCapacity({ storage: '100Mi' })
                + k.core.v1.persistentVolume.spec.hostPath.withPath('/mnt/data/crowdsec-config-pv')
;
local volume2 = k.core.v1.persistentVolume.new('crowdsec-db-pv')
                + k.core.v1.persistentVolume.metadata.withLabels({ type: 'local' })
                + k.core.v1.persistentVolume.spec.withAccessModes('ReadWriteOnce')
                + k.core.v1.persistentVolume.spec.withStorageClassName('manual')
                + k.core.v1.persistentVolume.spec.withCapacity({ storage: '1Gi' })
                + k.core.v1.persistentVolume.spec.hostPath.withPath('/mnt/data/crowdsec-db-pv')
;

[]
+ [volume1, volume2]
