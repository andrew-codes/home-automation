local secrets = import '../../../apps/secrets/dist/secrets.jsonnet';
local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local configApplicatorInitContainerProperies = {
  env: [{ name: 'GIT_BRANCH', value: 'main' }, { name: 'CHECKOUT_PATH', value: 'apps/home-assistant/src' }, { name: 'REPOSITORY', value: 'https://github.com/' + std.extVar('repositoryOwner') + '/' + std.extVar('repositoryName') + '.git' }],
  volumeMounts: [k.core.v1.volumeMount.new('home-assistant', '/config')],
};

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVar('port'), '8123')
                   + lib.deployment.withPort(0, std.extVar('name'), 'rtc-api', 1984, std.extVar('webrtc-port'))
                   + lib.deployment.withPort(0, std.extVar('name'), 'webrtc', 8555, '30713')
                   + lib.deployment.withEnvVars(0, [
                     { name: 'DEBUG', value: '' },
                     { name: 'MQTT_HOST', value: 'mqtt' },
                     { name: 'MQTT_PORT', value: '1883' },
                   ])
                   + lib.deployment.withAffinity({
                     nodeAffinity: {
                       requiredDuringSchedulingIgnoredDuringExecution: {
                         nodeSelectorTerms: [
                           { matchExpressions: [{ key: 'kubernetes.io/hostname', operator: 'In', values: ['k8s-main-node'] }] },
                         ],
                       },
                     },
                   },)
                   + lib.deployment.withInitContainer('mqtt-is-ready', std.extVar('registryHostname') + '/mqtt-client:latest', { env: [secrets['mqtt/username'], secrets['mqtt/password']], command: ['sh'], args: ['-c', 'timeout 10 sub -h mqtt -t "\\$SYS/#" -C 1 -u $MQTT_USERNAME -P $MQTT_PASSWORD | grep -v Error || exit 1'] })
                   + lib.deployment.withInitContainer('home-assistant-config-applicator', std.extVar('registryHostname') + '/home-assistant-config-applicator:latest', configApplicatorInitContainerProperies,)
                   + lib.deployment.withInitContainer('postgres-is-ready', 'postgres:13.3-alpine', { command: ['sh'], args: ['-c', 'until pg_isready -h home-assistant-postgres -p 5432; do echo waiting for database; sleep 2; done;'] })
                   + lib.deployment.withPersistentVolume('home-assistant')
                   + lib.deployment.withPersistentVolume('home-assistant-new-config')
                   + lib.deployment.withConfigMapVolume('ha-secrets')
                   + lib.deployment.withContainer('app-daemon', 'acockburn/appdaemon:dev', {
                     command: ['sh'],
                     args: ['-c', 'ln -s /home-assistant/appdaemon.yaml /conf/appdaemon.yaml && ln -s /home-assistant/apps /conf/apps && ln -s /home-assistant/dashboards /conf/dashboards && ln -s /home-assistant/secrets.yaml /conf/secrets.yaml && ./dockerStart.sh'],
                     livenessProbe: {
                       tcpSocket: {
                         port: 5050,
                       },
                       initialDelaySeconds: 60,
                       failureThreshold: 5,
                       timeoutSeconds: 10,
                       periodSeconds: 20,
                     },
                     readinessProbe: {
                       tcpSocket: {
                         port: 5050,
                       },
                       initialDelaySeconds: 60,
                       failureThreshold: 5,
                       timeoutSeconds: 10,
                       periodSeconds: 20,
                     },
                     startupProbe: {
                       tcpSocket: {
                         port: 5050,
                       },
                       initialDelaySeconds: 60,
                       failureThreshold: 30,
                       timeoutSeconds: 10,
                       periodSeconds: 10,
                     },
                   },)
                   + lib.deployment.withProbe(0, '/')
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('home-assistant', '/config',))
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('ha-secrets', '/root/set_ssh_keys.sh') + k.core.v1.volumeMount.withSubPath('set_ssh_keys.sh'))
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('ha-secrets', '/root/generate_secrets_yaml.sh') + k.core.v1.volumeMount.withSubPath('generate_secrets_yaml.sh'))
                   + lib.deployment.withSecurityContext(0, { privileged: true, allowPrivilegeEscalation: true },)
                   + lib.deployment.withEnvVars(0, [secrets['home-assistant/token'], secrets['home-assistant/server']],)
                   + lib.deployment.withPort(1, std.extVar('name'), 'appdaemon', 5050)
                   + lib.deployment.withVolumeMount(1, k.core.v1.volumeMount.new('home-assistant', '/home-assistant',));

local postgresContainer = k.core.v1.container.new(name='home-assistant-postgres', image=std.extVar('postgresImage'))
                          + k.core.v1.container.withImagePullPolicy('Always')
                          + k.core.v1.container.withPorts({
                            name: 'db',
                            containerPort: 5432,
                            protocol: 'TCP',
                          },)
                          + { volumeMounts: [k.core.v1.volumeMount.new('home-assistant', '/var/lib/postgresql/data')] }
                          + { command: ['sh'], args: ['-c', 'docker-entrypoint.sh postgres'] };
local postgresDeployment = k.apps.v1.deployment.new(name='home-assistant-postgres', containers=[postgresContainer],)
                           + k.apps.v1.deployment.spec.template.spec.withImagePullSecrets({ name: 'regcred' },)
                           + k.apps.v1.deployment.spec.template.spec.withServiceAccount('app',)
                           + { spec+: { template+: { spec+: { volumes: [k.core.v1.volume.fromPersistentVolumeClaim('home-assistant', 'home-assistant-postgres-db-pv-claim')] } } } };
local postgresService = k.core.v1.service.new('home-assistant-postgres', { name: 'home-assistant-postgres' }, [{
  name: 'db',
  port: 5432,
  protocol: 'TCP',
  targetPort: 'db',
}],);
local postgresVolume = lib.volume.persistentVolume.new('home-assistant-postgres-db', '40Gi');
local haVolume = lib.volume.persistentVolume.new('home-assistant', '10Gi');
local haVolumeNewConfig = lib.volume.persistentVolume.new('home-assistant-new-config', '7Gi');

local sttVolume = lib.volume.persistentVolume.new('whisper-data', '40Gi');
local sttContainer = k.core.v1.container.new(name='whisper', image='rhasspy/wyoming-whisper:2.1.0')
                     + k.core.v1.container.withImagePullPolicy('Always')
                     + k.core.v1.container.withPorts({
                       name: 'whisper',
                       containerPort: 10300,
                       protocol: 'TCP',
                     },)
                     + { volumeMounts: [k.core.v1.volumeMount.new('whisper-data', '/data')] }
                     + { args: ['--model', 'medium.en', '--language', 'en'] }
                     + k.core.v1.container.withEnv([
                       { name: 'TZ', value: 'America/New_York' },
                     ])
;
local sstDeployment = k.apps.v1.deployment.new(name='whisper', containers=[sttContainer],)
                      + k.apps.v1.deployment.spec.template.spec.withImagePullSecrets({ name: 'regcred' },)
                      + k.apps.v1.deployment.spec.template.spec.withServiceAccount('app',)
                      + { spec+: { template+: { spec+: { volumes: [k.core.v1.volume.fromPersistentVolumeClaim('whisper-data', 'whisper-data-pvc')] } } } }
;
local sstService = k.core.v1.service.new('whisper', { name: 'whisper' }, [{
  name: 'whisper',
  port: 10300,
  protocol: 'TCP',
  targetPort: 'whisper',
}],);

local ttsVolume = lib.volume.persistentVolume.new('piper-data', '40Gi');
local ttsContainer = k.core.v1.container.new(name='piper', image='rhasspy/wyoming-piper:1.5.0')
                     + k.core.v1.container.withImagePullPolicy('Always')
                     + k.core.v1.container.withPorts({
                       name: 'piper',
                       containerPort: 10200,
                       protocol: 'TCP',
                     },)
                     + { volumeMounts: [k.core.v1.volumeMount.new('piper-data', '/data')] }
                     + { args: ['--voice', 'en_US-hfc_female-medium'] }
                     + k.core.v1.container.withEnv([
                       { name: 'TZ', value: 'America/New_York' },
                     ])
;
local ttsDeployment = k.apps.v1.deployment.new(name='piper', containers=[ttsContainer],)
                      + k.apps.v1.deployment.spec.template.spec.withImagePullSecrets({ name: 'regcred' },)
                      + k.apps.v1.deployment.spec.template.spec.withServiceAccount('app',)
                      + { spec+: { template+: { spec+: { volumes: [k.core.v1.volume.fromPersistentVolumeClaim('piper-data', 'piper-data-pvc')] } } } }
;
local ttsService = k.core.v1.service.new('piper', { name: 'piper' }, [{
  name: 'piper',
  port: 10200,
  protocol: 'TCP',
  targetPort: 'piper',
}],);

local openWakeWordVolumeData = lib.volume.persistentVolume.new('open-wake-word-data', '40Gi');
local openWakeWordVolumeCustom = lib.volume.persistentVolume.new('open-wake-word-custom', '40Gi');
local openWakeWordContainer = k.core.v1.container.new(name='open-wake-word', image='rhasspy/wyoming-openwakeword:1.10.0')
                              + k.core.v1.container.withImagePullPolicy('Always')
                              + k.core.v1.container.withPorts({
                                name: 'open-wake-word',
                                containerPort: 10400,
                                protocol: 'TCP',
                              },)
                              + { volumeMounts: [k.core.v1.volumeMount.new('open-wake-word-data', '/data')] }
                              + { volumeMounts: [k.core.v1.volumeMount.new('open-wake-word-custom', '/custom')] }
                              + k.core.v1.container.withEnv([
                                { name: 'TZ', value: 'America/New_York' },
                              ])
;
local openWakeWordDeployment = k.apps.v1.deployment.new(name='open-wake-word', containers=[openWakeWordContainer],)
                               + k.apps.v1.deployment.spec.template.spec.withImagePullSecrets({ name: 'regcred' },)
                               + k.apps.v1.deployment.spec.template.spec.withServiceAccount('app',)
                               + { spec+: { template+: { spec+: { volumes: [k.core.v1.volume.fromPersistentVolumeClaim('open-wake-word-data', 'open-wake-word-data-pvc')] } } } }
                               + { spec+: { template+: { spec+: { volumes: [k.core.v1.volume.fromPersistentVolumeClaim('open-wake-word-custom', 'open-wake-word-custom-pvc')] } } } }
;
local openWakeWordService = k.core.v1.service.new('piper', { name: 'piper' }, [{
  name: 'open-wake-word',
  port: 10400,
  protocol: 'TCP',
  targetPort: 'open-wake-word',
}],)
;

local espHomeConfigVolume = lib.volume.persistentVolume.new('esphome-config', '10Gi');
local espHomeContainer = k.core.v1.container.new(name='esphome', image='esphome/esphome:2024.3.0')
                              + k.core.v1.container.withImagePullPolicy('Always')
                            
                              + { volumeMounts: [k.core.v1.volumeMount.new('esphome-config', '/config')] }
                              + k.core.v1.container.withEnv([
                                { name: 'TZ', value: 'America/New_York' },
                              ])
;
local espHomeDeployment = k.apps.v1.deployment.new(name='esphome', containers=[espHomeContainer],)
                               + k.apps.v1.deployment.spec.template.spec.withImagePullSecrets({ name: 'regcred' },)
                               + k.apps.v1.deployment.spec.template.spec.withServiceAccount('app',)
                               + { spec+: { template+: { spec+: { volumes: [k.core.v1.volume.fromPersistentVolumeClaim('esphome-config', 'esphome-config-pvc')] } } } }
                               +  {
                                    spec+: {
                                      template+: {
                                        spec+: {
                                          hostNetwork: true,
                                          dnsPolicy: 'ClusterFirstWithHostNet',
                                        },
                                      },
                                    },
                                  }
;

std.objectValues(deployment) + espHomeConfigVolume + [espHomeDeployment] + sttVolume + [sstDeployment, sstService] + ttsVolume + [ttsDeployment, ttsService] + openWakeWordVolumeData + openWakeWordVolumeCustom + [openWakeWordDeployment, openWakeWordService] + [postgresDeployment, postgresService] + haVolume + haVolumeNewConfig + postgresVolume 
