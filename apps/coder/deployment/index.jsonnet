local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.29/main.libsonnet';

local postgresContainer = k.core.v1.container.new(name='coder-postgres', image='postgres:13.16')
                          + k.core.v1.container.withImagePullPolicy('Always')
                          + { env: [
                            { name: 'POSTGRES_DB', value: 'coder' },
                            k.core.v1.envVar.fromSecretRef('POSTGRES_PASSWORD', 'coder-db-password', 'secret-value'),
                            k.core.v1.envVar.fromSecretRef('POSTGRES_USER', 'coder-db-username', 'secret-value'),
                          ] }
                          + k.core.v1.container.withPorts({
                            name: 'db',
                            containerPort: 5432,
                            protocol: 'TCP',
                          },)
                          + { volumeMounts: [k.core.v1.volumeMount.new('data', '/var/lib/postgresql/data')] }
                          + { command: ['sh'], args: ['-c', 'docker-entrypoint.sh postgres'] };
local postgresDeployment = k.apps.v1.deployment.new(name='coder-postgres', containers=[postgresContainer],)
                           + k.apps.v1.deployment.spec.template.spec.withImagePullSecrets({ name: 'regcred' },)
                           + k.apps.v1.deployment.spec.template.spec.withServiceAccount('app',)
                           + { spec+: { template+: { spec+: { volumes: [k.core.v1.volume.fromPersistentVolumeClaim('data', 'coder-postgres-pvc')] } } } }
                           + {
                             spec+: {
                               template+: {
                                 spec+: {
                                   affinity: {
                                     nodeAffinity: {
                                       requiredDuringSchedulingIgnoredDuringExecution: {
                                         nodeSelectorTerms: [
                                           { matchExpressions: [{ key: 'kubernetes.io/hostname', operator: 'In', values: ['k8s-main'] }] },
                                         ],
                                       },
                                     },
                                   },
                                 },
                               },
                             },
                           }
;
local postgresService = k.core.v1.service.new('coder-postgres', { name: 'coder-postgres' }, [{
  name: 'db',
  port: 5432,
  protocol: 'TCP',
  targetPort: 'db',
}],);
local postgresVolume = lib.volume.persistentVolume.new('coder-postgres', '20Gi');
local coderWorkspaceVolume = k.core.v1.persistentVolume.new('coder-workspace-pv')
                             + k.core.v1.persistentVolume.spec.withAccessModes('ReadWriteMany')
                             + k.core.v1.persistentVolume.spec.withStorageClassName('nfs')
                             + k.core.v1.persistentVolume.spec.withCapacity({ storage: '20Gi' })
                             + k.core.v1.persistentVolume.spec.nfs.withPath('/volume1/k8s-data/coder-workspace')
                             + k.core.v1.persistentVolume.spec.nfs.withServer(std.extVar('nfsIp'))
                             + k.core.v1.persistentVolume.spec.nfs.withReadOnly(false)
                             + k.core.v1.persistentVolume.spec.withMountOptions(['nfsvers=4.1'])
                             + k.core.v1.persistentVolume.spec.withVolumeMode('Filesystem')
                             + k.core.v1.persistentVolume.spec.withPersistentVolumeReclaimPolicy('Recycle')
;

[]
+ postgresVolume
+ [coderWorkspaceVolume]
+ [postgresDeployment, postgresService]
