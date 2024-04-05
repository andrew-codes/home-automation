local secrets = import '../../../apps/secrets/dist/secrets.jsonnet';
local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local configApplicatorInitContainerProperies = {
  env: [{ name: 'GIT_BRANCH', value: 'main' }, { name: 'CHECKOUT_PATH', value: 'apps/home-assistant/src' }, { name: 'REPOSITORY', value: 'https://github.com/' + std.extVar('repositoryOwner') + '/' + std.extVar('repositoryName') + '.git' }],
  volumeMounts: [k.core.v1.volumeMount.new('home-assistant-config', '/config')],
};

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVar('port'), '8123')
                   + lib.deployment.withPort(0, std.extVar('name'), 'rtc-api', 1984, std.extVar('webrtc-port'))
                   + lib.deployment.withPort(0, std.extVar('name'), 'webrtc', 8555, '30713')
                   + lib.deployment.withEnvVars(0, [
                     { name: 'DEBUG', value: '' },
                     { name: 'MQTT_HOST', value: 'mqtt' },
                     { name: 'MQTT_PORT', value: '1883' },
                   ])
                   + lib.deployment.withInitContainer('mqtt-is-ready', std.extVar('registryHostname') + '/mqtt-client:latest', { env: [secrets['mqtt/username'], secrets['mqtt/password']], command: ['sh'], args: ['-c', 'timeout 10 sub -h mqtt -t "\\$SYS/#" -C 1 -u $MQTT_USERNAME -P $MQTT_PASSWORD | grep -v Error || exit 1'] })
                   + lib.deployment.withInitContainer('home-assistant-config-applicator', std.extVar('registryHostname') + '/home-assistant-config-applicator:latest', configApplicatorInitContainerProperies,)
                   + lib.deployment.withInitContainer('postgres-is-ready', 'postgres:13.3-alpine', { command: ['sh'], args: ['-c', 'until pg_isready -h home-assistant-postgres -p 5432; do echo waiting for database; sleep 2; done;'] })
                   + lib.deployment.withPersistentVolume('home-assistant-config')
                   + lib.deployment.withPersistentVolume('home-assistant-new-config')
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
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('home-assistant-config', '/config',))
                   + lib.deployment.withSecurityContext(0, { privileged: true, allowPrivilegeEscalation: true },)
                   + lib.deployment.withEnvVars(0, [secrets['home-assistant/token'], secrets['home-assistant/server']],)
                   + lib.deployment.withPort(1, std.extVar('name'), 'appdaemon', 5050)
                   + lib.deployment.withVolumeMount(1, k.core.v1.volumeMount.new('home-assistant-config', '/home-assistant',))
;
local haVolume = lib.volume.persistentNfsVolume.new('home-assistant-config', '10Gi', std.extVar('nfsIp'), std.extVar('nfsUsername'), std.extVar('nfsPassword'))
;
local haVolumeNewConfig = lib.volume.persistentNfsVolume.new('home-assistant-new-config', '10Gi', std.extVar('nfsIp'), std.extVar('nfsUsername'), std.extVar('nfsPassword'))
;

local postgresContainer = k.core.v1.container.new(name='home-assistant-postgres', image=std.extVar('postgresImage'))
                          + k.core.v1.container.withImagePullPolicy('Always')
                          + { env: [
                            k.core.v1.envVar.fromSecretRef('POSTGRES_DB', 'home-assistant-postgres-db', 'secret-value'),
                            k.core.v1.envVar.fromSecretRef('POSTGRES_PASSWORD', 'home-assistant-postgres-password', 'secret-value'),
                            k.core.v1.envVar.fromSecretRef('POSTGRES_USER', 'home-assistant-postgres-username', 'secret-value'),
                          ] }
                          + k.core.v1.container.withPorts({
                            name: 'db',
                            containerPort: 5432,
                            protocol: 'TCP',
                          },)
                          + { volumeMounts: [k.core.v1.volumeMount.new('data', '/var/lib/postgresql/data')] }
                          + { command: ['sh'], args: ['-c', 'docker-entrypoint.sh postgres'] };
local postgresDeployment = k.apps.v1.deployment.new(name='home-assistant-postgres', containers=[postgresContainer],)
                           + k.apps.v1.deployment.spec.template.spec.withImagePullSecrets({ name: 'regcred' },)
                           + k.apps.v1.deployment.spec.template.spec.withServiceAccount('app',)
                           + { spec+: { template+: { spec+: { volumes: [k.core.v1.volume.fromPersistentVolumeClaim('data', 'home-assistant-postgres-pvc')] } } } }
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
local postgresService = k.core.v1.service.new('home-assistant-postgres', { name: 'home-assistant-postgres' }, [{
  name: 'db',
  port: 5432,
  protocol: 'TCP',
  targetPort: 'db',
}],);
local postgresVolume = lib.volume.persistentVolume.new('home-assistant-postgres', '40Gi');


local ttsVolume = lib.volume.persistentNfsVolume.new('piper-data', '40Gi', std.extVar('nfsIp'), std.extVar('nfsUsername'), std.extVar('nfsPassword'))
;
local ttsContainer = k.core.v1.container.new(name='piper', image='rhasspy/wyoming-piper:1.5.0')
                     + k.core.v1.container.withImagePullPolicy('Always')
                     + k.core.v1.container.withPorts({
                       name: 'piper',
                       containerPort: 10200,
                       protocol: 'TCP',
                     },)
                     + { volumeMounts: [k.core.v1.volumeMount.new('piper-data', '/data')] }
                     + { args: ['--voice', 'en_US-hfc_female-medium', '--debug'] }
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


// local openWakeWordVolumeData = lib.volume.persistentVolume.new('open-wake-word-data', '40Gi');
// local openWakeWordVolumeCustom = lib.volume.persistentVolume.new('open-wake-word-custom', '40Gi');
// local openWakeWordContainer = k.core.v1.container.new(name='open-wake-word', image='rhasspy/wyoming-openwakeword:1.10.0')
//                               + k.core.v1.container.withImagePullPolicy('Always')
//                               + k.core.v1.container.withPorts({
//                                 name: 'open-wake-word',
//                                 containerPort: 10400,
//                                 protocol: 'TCP',
//                               },)
//                               + { volumeMounts: [k.core.v1.volumeMount.new('open-wake-word-data', '/data'), k.core.v1.volumeMount.new('open-wake-word-custom', '/custom')] }
//                               + k.core.v1.container.withEnv([
//                                 { name: 'TZ', value: 'America/New_York' },
//                               ])
// ;
// local openWakeWordDeployment = k.apps.v1.deployment.new(name='open-wake-word', containers=[openWakeWordContainer],)
//                                + k.apps.v1.deployment.spec.template.spec.withImagePullSecrets({ name: 'regcred' },)
//                                + k.apps.v1.deployment.spec.template.spec.withServiceAccount('app',)
//                                + { spec+: { template+: { spec+: { volumes: [
//                                  k.core.v1.volume.fromPersistentVolumeClaim('open-wake-word-data', 'open-wake-word-data-pvc'),
//                                  k.core.v1.volume.fromPersistentVolumeClaim('open-wake-word-custom', 'open-wake-word-custom-pvc'),
//                                ] } } } }
// ;
// local openWakeWordService = k.core.v1.service.new('open-wake-word', { name: 'open-wake-word' }, [{
//   name: 'open-wake-word',
//   port: 10400,
//   protocol: 'TCP',
//   targetPort: 'open-wake-word',
// }],)
// ;

local espHomeConfigVolume = lib.volume.persistentNfsVolume.new('esphome-config', '10Gi', std.extVar('nfsIp'), std.extVar('nfsUsername'), std.extVar('nfsPassword'))
;
local espGitConfigVolume = k.core.v1.configMap.new('esphome-gitconfig', { '.gitconfig': '[safe]\n        directory = *' })
;
local espHomeContainer = k.core.v1.container.new(name='esphome', image='esphome/esphome:2024.3.0')
                         + k.core.v1.container.withImagePullPolicy('Always')

                         + { volumeMounts: [
                           k.core.v1.volumeMount.new('esphome-config', '/config'),
                           k.core.v1.volumeMount.new('esphome-gitconfig', '/root/.gitconfig') + k.core.v1.volumeMount.withSubPath('.gitconfig'),
                         ] }
                         + k.core.v1.container.withPorts({
                           name: 'esphome',
                           containerPort: 6052,
                           protocol: 'TCP',
                         },)
                         + k.core.v1.container.withEnv([
                           { name: 'TZ', value: 'America/New_York' },
                         ])
;
local espHomeDeployment = k.apps.v1.deployment.new(name='esphome', containers=[espHomeContainer],)
                          + k.apps.v1.deployment.spec.template.spec.withImagePullSecrets({ name: 'regcred' },)
                          + k.apps.v1.deployment.spec.template.spec.withServiceAccount('app',)
                          + { spec+: { template+: { spec+: { volumes: [
                            k.core.v1.volume.fromPersistentVolumeClaim('esphome-config', 'esphome-config-pvc'),
                            {
                              name: 'esphome-gitconfig',
                              configMap: { name: 'esphome-gitconfig', defaultMode: 384 },
                            },
                          ] } } } }
                          + {
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


// local wasVolume = lib.volume.persistentVolume.new('willow-as-storage', '40Gi');
// local wasDeployment = lib.deployment.new('willow-as', 'ghcr.io/toverainc/willow-application-server:latest', {}, std.extVar('willowASPort'), '8502')
//                    + lib.deployment.withEnvVars(0, [
//                      { name: 'TZ', value: 'America/New_York' },
//                    ])
//                    + lib.deployment.withPersistentVolume('willow-as-storage')
//                    + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('willow-as-storage', '/was-storage',))
//                    + lib.deployment.withSecurityContext(0, { privileged: true, allowPrivilegeEscalation: true },)
// ;

haVolume + haVolumeNewConfig + std.objectValues(deployment)
+ ttsVolume + [ttsDeployment, ttsService]
+ postgresVolume + [postgresDeployment, postgresService]
+ espHomeConfigVolume + [espHomeDeployment, espGitConfigVolume]
