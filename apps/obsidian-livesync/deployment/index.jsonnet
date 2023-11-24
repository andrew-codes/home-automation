local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local localIniConfigMap = {
  'local.ini': std.extVar('localIni'),
};

local deployment = lib.deployment.new(std.extVar('name'), "couchdb:3.3.2", [], std.extVar('port'), '5984')
                  + lib.deployment.withEnvVars(0, [
                      { name: 'COUCHDB_USER', value: std.extVar('couchDbUser') },
                      { name: 'COUCHDB_PASSWORD', value: std.extVar('couchDbPassword') },
                    ])
                   + lib.deployment.withConfigMapVolume('local-ini-config')
                   + lib.deployment.withPersistentVolume('obsidian-livesync')
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('obsidian-livesync', '/opt/couchdb/data',))
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('local-ini-config', '/opt/couchdb/etc/local.ini') + k.core.v1.volumeMount.withSubPath('local.ini'));

local configMap = lib.volume.configMapVolume.new('local-ini-config', localIniConfigMap);
local pvc = lib.volume.persistentVolume.new('obsidian-livesync', '50Gi');

pvc + configMap + std.objectValues(deployment)
