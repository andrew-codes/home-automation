local secrets = import '../../../apps/secrets/dist/secrets.jsonnet';
local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVar('port'), '2342')
                   + lib.deployment.withEnvVars(0, [
                     { name: 'PHOTOPRISM_HTTP_HOST', value: '0.0.0.0' },
                     { name: 'PHOTOPRISM_SPONSOR', value: 'true' },
                     { name: 'PHOTOPRISM_SITE_URL', value: 'https://photos.smith-simms.family/' },
                     { name: 'PHOTOPRISM_EXPERIMENTAL', value: 'true' },
                     { name: 'PHOTOPRISM_DISABLE_CHOWN', value: 'false' },
                     { name: 'PHOTOPRISM_DISABLE_WEBDAV', value: 'false' },
                     { name: 'PHOTOPRISM_DISABLE_SETTINGS', value: 'false' },
                     { name: 'PHOTOPRISM_DISABLE_TENSORFLOW', value: 'false' },
                     { name: 'PHOTOPRISM_DISABLE_FACES', value: 'false' },
                     { name: 'PHOTOPRISM_DISABLE_CLASSIFICATION', value: 'false' },
                     { name: 'PHOTOPRISM_DISABLE_RAW', value: 'false' },
                     { name: 'PHOTOPRISM_RAW_PRESETS', value: 'true' },
                     { name: 'PHOTOPRISM_DEBUG', value: 'true' },
                     { name: 'PHOTOPRISM_CACHE_PATH', value: '/assets/cache' },
                     { name: 'PHOTOPRISM_IMPORT_PATH', value: '/assets/photos/import' },
                     { name: 'PHOTOPRISM_EXPORT_PATH', value: '/assets/photos/export' },
                     { name: 'PHOTOPRISM_ORIGINALS_PATH', value: '/assets/photos/originals' },
                     k.core.v1.envVar.fromSecretRef('PHOTOPRISM_ADMIN_PASSWORD', 'photoprism-admin-password', 'secret-value'),
                     k.core.v1.envVar.fromSecretRef('PHOTOPRISM_ADMIN_USER', 'photoprism-admin-username', 'secret-value'),
                     { name: 'PHOTOPRISM_AUTH_MODE', value: 'password' },
                     { name: 'PHOTOPRISM_HTTP_COMPRESSION', value: 'gzip' },
                     { name: 'PHOTOPRISM_JPEG_QUALITY', value: '100' },
                     { name: 'PHOTOPRISM_DATABASE_DRIVER', value: 'mysql' },
                     { name: 'PHOTOPRISM_DATABASE_SERVER', value: 'photoprism-db:3306' },
                     { name: 'PHOTOPRISM_DATABASE_NAME', value: 'photoprism' },
                     k.core.v1.envVar.fromSecretRef('PHOTOPRISM_DATABASE_USER', 'photoprism-db-username', 'secret-value'),
                     k.core.v1.envVar.fromSecretRef('PHOTOPRISM_DATABASE_PASSWORD', 'photoprism-db-password', 'secret-value'),
                   ])
                   + lib.deployment.withPersistentVolume('originals')
                   + lib.deployment.withPersistentVolume('photoprism-import')
                   + lib.deployment.withPersistentVolume('photoprism-export')
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('originals', '/assets/photos/originals',))
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('photoprism-import', '/assets/photos/import',))
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('photoprism-export', '/assets/photos/export',))
;

local originalsPvc = lib.volume.persistentVolume.new('originals', '600Gi');
local importPvc = lib.volume.persistentVolume.new('photoprism-import', '50Gi');
local exportPvc = lib.volume.persistentVolume.new('photoprism-export', '200Gi');

local dbContainer = k.core.v1.container.new(name='photoprismdb', image=std.extVar('dbImage'))
                    + k.core.v1.container.withImagePullPolicy('Always')
                    + k.core.v1.container.withPorts({
                      name: 'db',
                      containerPort: 3306,
                      protocol: 'TCP',
                    },)
                    + { volumeMounts: [k.core.v1.volumeMount.new('photoprism-db', '/var/lib/mysql')] }
                    + { env: [
                      k.core.v1.envVar.fromSecretRef('MARIADB_ROOT_PASSWORD', 'photoprism-db-root-password', 'secret-value'),
                      k.core.v1.envVar.fromSecretRef('MARIADB_USER', 'photoprism-db-username', 'secret-value'),
                      k.core.v1.envVar.fromSecretRef('MARIADB_PASSWORD', 'photoprism-db-password', 'secret-value'),
                      { name: 'MARIADB_DATABASE', value: 'photoprism' },
                      { name: 'MARIADB_AUTO_UPGRADE', value: '1' },
                      { name: 'MARIADB_INITDB_SKIP_TZINFO', value: '1' },
                    ] }
;
local dbDeployment = k.apps.v1.deployment.new(name='photoprism-db', containers=[dbContainer],)
                     + k.apps.v1.deployment.spec.template.spec.withServiceAccount('app',)
                     + { spec+: { template+: { spec+: { volumes: [k.core.v1.volume.fromPersistentVolumeClaim('photoprism-db', 'photoprism-db-pvc')] } } } };
local dbService = k.core.v1.service.new('photoprism-db', { name: 'photoprism-db' }, [{
  name: 'db',
  port: 3306,
  protocol: 'TCP',
  targetPort: 'db',
}],)
;
local dbDataPvc = lib.volume.persistentVolume.new('photoprism-db', '200Gi');


originalsPvc + importPvc + exportPvc + dbDataPvc + [dbDeployment, dbService] + std.objectValues(deployment)
