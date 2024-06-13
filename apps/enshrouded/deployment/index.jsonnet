local secrets = import '../../../apps/secrets/dist/secrets.jsonnet';
local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local deployment = lib.deployment.new(std.extVar('name'), 'mbround18/enshrouded-docker:1.1.0-proton', std.extVar('secrets'), '', '', true)
                   + lib.deployment.withEnvVars(0, [
                     { name: 'SERVER_SLOT_COUNT', value: '4' },
                     { name: 'UPDATE_CRON', value: '*/30 * * * *' },
                     { name: 'BACKUP_CRON', value: '*/15 * * * *' },
                     { name: 'BACKUP_MAX_COUNT', value: '10000' },
                   ])
                   //  + {
                   //    deployment+: {
                   //      spec+: {
                   //        template+: {
                   //          spec+: {
                   //            containers: [super.containers[0] { ports+: [{ name: 'port1tcp', containerPort: 15636, protocol: 'TCP' }, { name: 'port1udp', containerPort: 15636, protocol: 'UDP' }] }] + super.containers[1:],
                   //          },
                   //        },
                   //      },
                   //    },
                   //    'service-port1tcp': k.core.v1.service.new('port1tcp', { name: std.extVar('name') }, [{ name: 'port1tcp', port: 15636, targetPort: 'port1tcp', protocol: 'TCP' }]),
                   //    'service-port1udp': k.core.v1.service.new('port1ludp', { name: std.extVar('name') }, [{ name: 'port1ludp', port: 15636, targetPort: 'port1ludp', protocol: 'UDP' }]),
                   //  }
                   + {
                     deployment+: {
                       spec+: {
                         template+: {
                           spec+: {
                             containers: [super.containers[0] { ports+: [{ name: 'port2tcp', containerPort: 15637, protocol: 'TCP' }, { name: 'port2udp', containerPort: 15637, protocol: 'UDP' }] }] + super.containers[1:],
                           },
                         },
                       },
                     },
                     'service-port2tcp': k.core.v1.service.new('port2tcp', { name: std.extVar('name') }, [{ name: 'port2tcp', port: 15637, targetPort: 'port2tcp', protocol: 'TCP' }])
                                         + k.core.v1.servicePort.withNodePort(std.parseInt(std.extVar('porttcp'))),
                     'service-port2udp': k.core.v1.service.new('port2ludp', { name: std.extVar('name') }, [{ name: 'port2ludp', port: 15637, targetPort: 'port2ludp', protocol: 'UDP' }])
                                         + k.core.v1.servicePort.withNodePort(std.parseInt(std.extVar('portudp'))),
                   }
                   + lib.deployment.withPersistentVolume('enshrouded-game-data')
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('enshrouded-game-data', '/opt/enshrouded',))
;

local pvc = lib.volume.persistentNfsVolume.new('enshrouded-game-data', '100Gi', std.extVar('nfsIp'), std.extVar('nfsUsername'), std.extVar('nfsPassword'))
;

pvc + std.objectValues(deployment)
