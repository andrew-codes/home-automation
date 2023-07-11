local secrets = import '../../../apps/secrets/dist/secrets.jsonnet';
local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local configApplicatorInitContainerProperies = {
  env: [{ name: 'GIT_BRANCH', value: 'main' }, { name: 'CHECKOUT_PATH', value: 'apps/home-assistant/src' }, { name: 'REPOSITORY', value: 'https://github.com/' + std.extVar('repositoryOwner') + '/' + std.extVar('repositoryName') + '.git' }],
  volumeMounts: [k.core.v1.volumeMount.new('home-assistant', '/config')],
};

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVar('port'), '8123')
                   + lib.deployment.withPort(0, std.extVar('name'), 'rtc-api', 1984, std.extVar('webrtc-port'))
                   + lib.deployment.withPort(0, std.extVar('name'), 'webrtc', 8555, 30713)
                   + lib.deployment.withEnvVars(0, [
                     { name: 'DEBUG', value: '' },
                     { name: 'MQTT_HOST', value: 'mqtt' },
                     { name: 'MQTT_PORT', value: '1883' },
                   ])
                   + lib.deployment.withAffinity({
                     nodeAffinity: {
                       requiredDuringSchedulingIgnoredDuringExecution: {
                         nodeSelectorTerms: [
                           { matchExpressions: [{ key: 'beta.kubernetes.io/arch', operator: 'In', values: ['amd64'] }] },
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
local postgresVolume = lib.volume.persistentVolume.new('home-assistant-postgres-db', '40Gi', '/mnt/data/home-assistant-postgres');
local haVolume = lib.volume.persistentVolume.new('home-assistant', '10Gi', '/mnt/data/home-assistant');
local haVolumeNewConfig = lib.volume.persistentVolume.new('home-assistant-new-config', '7Gi', '/mnt/data/home-assistant-new-config');

haVolume + haVolumeNewConfig + postgresVolume + [postgresDeployment, postgresService] + std.objectValues(deployment)
