local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), '', '80')
                   + lib.deployment.withEnvVars(0, [
                     { name: 'DEBUG', value: '' },
                     { name: 'MQTT_HOST', value: 'mqtt' },
                     { name: 'MQTT_PORT', value: '1883' },
                     { name: 'NODE_TLS_REJECT_UNAUTHORIZED', value: '0' },
                     { name: 'DB_HOST', value: 'gaming-library-db' },
                   ]);

std.objectValues(deployment)