local secrets = import '../../../apps/secrets/dist/secrets.jsonnet';
local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.29/main.libsonnet';

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVar('port'), '3000')
                   + lib.deployment.withEnvVars(0, [
                     { name: 'DB_HOST', value: 'game-library-db' },
                     { name: 'DEBUG', value: 'playnite-web-app/*' },
                     { name: 'MQTT_HOST', value: 'mqtt' },
                     { name: 'MQTT_PORT', value: '1883' },
                     { name: 'USERNAME', value: std.extVar('username') },
                     { name: 'PASSWORD', value: std.extVar('password') },
                     { name: 'SECRET', value: std.extVar('secret') },
                   ])
                   + lib.deployment.withProbe(0, '/')
;

std.objectValues(deployment)
