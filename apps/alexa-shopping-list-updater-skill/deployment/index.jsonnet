local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVar('port'))
                   + lib.deployment.withEnvVars(0, [
                     { name: 'NODE_TLS_REJECT_UNAUTHORIZED', value: '0' },
                     { name: 'DEBUG', value: '' },
                     { name: 'MQTT_HOST', value: 'mqtt' },
                     { name: 'MQTT_PORT', value: '1883' },
                   ]);

std.objectValues(deployment)
