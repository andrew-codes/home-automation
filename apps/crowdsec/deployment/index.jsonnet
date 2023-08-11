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

local claim1 = k.core.v1.persistentVolumeClaim.new('crowdsec-config-pvc')
               + k.core.v1.persistentVolumeClaim.metadata.withLabels({ type: 'local' })
               + k.core.v1.persistentVolumeClaim.spec.withAccessModes('ReadWriteOnce')
               + k.core.v1.persistentVolumeClaim.spec.withStorageClassName('manual')
               + k.core.v1.persistentVolumeClaim.spec.resources.withRequests({ storage: '100Mi' })
;

local claim2 = k.core.v1.persistentVolumeClaim.new('crowdsec-db-pvc')
               + k.core.v1.persistentVolumeClaim.metadata.withLabels({ type: 'local' })
               + k.core.v1.persistentVolumeClaim.spec.withAccessModes('ReadWriteOnce')
               + k.core.v1.persistentVolumeClaim.spec.withStorageClassName('manual')
               + k.core.v1.persistentVolumeClaim.spec.resources.withRequests({ storage: '1Gi' })
;

local acquisConfigMap = {
  apiVersion: 'v1',
  kind: 'ConfigMap',
  metadata: {
    name: 'logstash-configmap',
    namespace: 'default',
  },
  data: |||
    source: file
    filenames:
    - /tmp/foo/*.log
    - /var/log/syslog
    labels:
    type: syslog
  |||,
}
;

local dashboardNodePort = { name: 'logstash-http', port: 5044, targetPort: 5044 } +
                          k.core.v1.servicePort.withNodePort(std.parseInt(
                            std.extVar('crowdsecDashboardPort')
                          ))
;
local dashboardService = k.core.v1.service.new('logstash', {
                           app: 'logstash',
                         }, [dashboardNodePort]) +
                         k.core.v1.service.spec.withType('NodePort',)
;

[dashboardService]
+ [acquisConfigMap, volume1, volume2, claim1, claim2]
