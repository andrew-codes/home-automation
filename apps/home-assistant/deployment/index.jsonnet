local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.23/main.libsonnet';

local configApplicatorInitContainerProperies = {
  env: [{ name: 'GIT_BRANCH', value: 'main' }, { name: 'CHECKOUT_PATH', value: 'apps/home-assistant/src' }, { name: 'REPOSITORY', value: 'https://github.com/' + std.extVar('repositoryOwner') + '/' + std.extVar('repositoryName') + '.git' }],
  volumeMounts: [{ name: 'home-assistant-config-volume', value: '/config' }, { name: 'home-assistant-new-config-volume', value: '/new-config' }],
};

local haSecretsConfigMapData = {
  'set_ssh_keys.sh': '\n#!/usr/bin env sh\nmkdir -p /root/.ssh\necho -e "${HOME_ASSISTANT_SSH_KEY_PRIVATE}" > /root/.ssh/id_rsa\necho -e "${HOME_ASSISTANT_SSH_KEY_PUBLIC}" > /root/.ssh/id_rsa.pub\nchmod 0600 /root/.ssh/*',
  'generate_secrets_yaml.sh:': "
#!/usr/bin env sh
echo \"
APPDAEMON_PASSWORD: '${HOME_ASSISTANT_APPDAEMON_PASSWORD}'
APPDAEMON_URL: '${HOME_ASSISTANT_APPDAEMON_URL}'
DOUBLE_TAKE_TOKEN: '${HOME_ASSISTANT_DOUBLE_TAKE_TOKEN}'
ELEVATION: '${HOME_ASSISTANT_ELEVATION}'
GAMING_ROOM_GAMING_PC_IP: '${HOME_ASSISTANT_GAME_ROOM_GAMING_PC_IP}'
GAMING_ROOM_GAMING_PC_MAC: '${HOME_ASSISTANT_GAME_ROOM_GAMING_PC_MAC}'
GAMING_ROOM_MACHINE_USERNAME: '${HOME_ASSISTANT_GAME_ROOM_MACHINE_USERNAME}'
GAMING_ROOM_NVIDIA_SHIELD_IP: '${HOME_ASSISTANT_GAME_ROON_NVIDIA_SHIELD_IP}'
GAMING_ROOM_PLAYSTATION_5_IP: '${HOME_ASSISTANT_GAME_ROON_PLAYSTATION_5_IP}'
GAMING_ROOM_TV_IP: '${HOME_ASSISTANT_GAME_ROON_TV_IP}'
GAMING_ROOM_TV_MAC: '${HOME_ASSISTANT_GAME_ROON_TV_MAC}'
GITHUB_RUNNER_AUTH_HEADER: 'token ${HOME_ASSISTANT_GITHUB_TOKEN}'
GOOGLE_CALENDAR_CLIENT_ID: '${HOME_ASSISTANT_GOOGLE_CALENDAR_CLIENT_ID}'
GOOGLE_CALENDAR_CLIENT_SECRET: '${HOME_ASSISTANT_GOOGLE_CALENDAR_CLIENT_SECRET}'
HA_TOKEN: '${HOME_ASSISTANT_TOKEN}'
HA_URL: 'https://${HOME_ASSISTANT_DOMAIN}'
HOME_AUTOMATION_PRIVATE_SSH_KEY: '${HOME_ASSISTANT_SSH_KEY_PRIVATE}'
HOME_AUTOMATION_PUBLIC_SSH_KEY: '${HOME_ASSISTANT_SSH_KEY_PUBLIC}'
INFLUXDB_TOKEN: '${HOME_ASSISTANT_INFLUXDB_TOKEN}'
JIRA_AUTHORIZATION_HEADER: '${HOME_ASSISTANT_JIRA_AUTHORIZATION_HEADER}'
LATITUDE: '${HOME_ASSISTANT_LATITUDE}'
LONGITUDE: '${HOME_ASSISTANT_LONGITUDE}'
POSTGRES_DB: '${HOME_ASSISTANT_POSTGRES_DB}'
POSTGRES_PASSWORD: '${HOME_ASSISTANT_POSTGRES_PASSWORD}'
POSTGRES_USER: '${HOME_ASSISTANT_POSTGRES_USERNAME}'
ROUTER_IP: '${UNIFI_IP}'
SPOTCAST_DC: '${HOME_ASSISTANT_SPOTCAST_DC}'
SPOTCAST_DC_2: '${HOME_ASSISTANT_SPOTCAST_DC_2}'
SPOTCAST_KEY: '${HOME_ASSISTANT_SPOTCAST_KEY}'
SPOTCAST_KEY_2: '${HOME_ASSISTANT_SPOTCAST_KEY_2}'
SPOTIFY_CLIENT_ID: '${HOME_ASSISTANT_SPOTIFY_CLIENT_ID}'
SPOTIFY_CLIENT_SECRET: '${HOME_ASSISTANT_SPOTIFY_CLIENT_SECRET}'
TIME_ZONE: '${HOME_ASSISTANT_TIME_ZONE}'
UNIFI_PASSWORD: '${UNIFI_PASSWORD}'
UNIFI_USERNAME: '${UNIFI_USERNAME}'
UNIT_SYSTEM: '${HOME_ASSISTANT_UNIT_SYSTEM}'
WITHINGS_CLIENT_ID: '${HOME_ASSISTANT_WITHINGS_CLIENT_ID}'
WITHINGS_CLIENT_SECRET: '${HOME_ASSISTANT_WITHINGS_CLIENT_SECRET}'
MQTT_USERNAME: '${MQTT_USERNAME}'
MQTT_PASSWORD: '${MQTT_PASSWORD}'
TURN_OFF_GAMING_ROOM_GAMING_PC_COMMAND: 'ssh -n -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -i /root/.ssh/id_rsa ${HOME_ASSISTANT_GAME_ROOM_MACHINE_USERNAME}@${HOME_ASSISTANT_GAME_ROOM_GAMING_PC_IP} \\\"C:\\Windows\\System32\\rundll32.exe powrprof.dll,SetSuspendState Standby\\\"'
DB_URL: 'postgresql://${HOME_ASSISTANT_POSTGRES_USERNAME}:${HOME_ASSISTANT_POSTGRES_PASSWORD}@home-assistant-postgres:5432/${HOME_ASSISTANT_POSTGRES_DB}'
\"",
};

local postgresContainer = k.core.v1.container.new(name='home-assistant-postgres', image=std.extVar('postgresImage'))
                          + k.core.v1.container.withImagePullPolicy('Always')
                          + k.core.v1.container.withPorts({
                            name: 'db',
                            containerPort: 5432,
                            protocol: 'TCP',
                          },)
                          + { volumeMounts: [k.core.v1.volumeMount.new('home-assistant-db-volume', '/var/lib/postgresql/data')] }
                          + { command: 'sh', args: ['-c', 'docker-entrypoint.sh postgres'] };


lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVars('externalPort'), 8123) + lib.deployment.withEnvVars(0, [
  { name: 'DEBUG', value: '' },
  { name: 'MQTT_HOST', value: 'mqtt' },
  { name: 'MQTT_PORT', value: '1883' },
])
+ lib.deployment.withHostNetwork()
+ lib.deployment.withAffinity({
  nodeAffinity: {
    requiredDuringSchedulingIgnoredDuringExecution: {
      nodeSelectorTerms: [
        { matchExpressions: [{ key: 'beta.kubernetes.io/arch', operator: 'In', values: ['amd64'] }] },
      ],
    },
  },
},)
+ lib.deployment.withInitContainer('mqtt-is-ready', std.extVar('registryHostname') + 'mqtt-client:latest', { command: 'sh', args: ['-c', 'timeout 10 sub -h mqtt -t "$SYS/#" -C 1 | grep -v Error || exit 1'] })
+ lib.deployment.withInitContainer('home-assistant-config-applicator', std.extVar('registryHostname') + 'home-assistant-config-applicator:latest', configApplicatorInitContainerProperies,)
+ lib.deployment.withInitContainer('frigate-is-ready', 'curlimages/curl:latest', { command: 'sh', args: ['-c', "timeout 10 curl --fail --insecure --silent --output /dev/null --write-out 'HTTP Code %{http_code}' 'http://frigate:5000' || exit 1"] })
+ lib.deployment.withInitContainer('postgres-is-ready', 'postgres:13.3-alpine', { comamnd: 'sh', args: ['-c', 'until pg_isready -h home-assistant-postgres -p 5432; do echo waiting for database; sleep 2; done;'] })
+ lib.deployment.withPersistentVolume('home-assistant-config-volume', '10Gi', '/mnt/data/home-assistant')
+ lib.deployment.withPersistentVolume('home-assistant-new-config-volume', '10Gi', '/mnt/data/home-assistant-new-config')
+ lib.deployment.withConfigMapVolume('ha-secrets', haSecretsConfigMapData)
+ lib.deployment.withContainer('app-daemon', 'acockburn/appdaemon:dev', { command: 'sh', args: ['-c', 'ln -s /home-assistant/appdaemon.yaml /conf/appdaemon.yaml && ln -s /home-assistant/apps /conf/apps && ln -s /home-assistant/dashboards /conf/dashboards && ln -s /home-assistant/secrets.yaml /conf/secrets.yaml && ./dockerStart.sh'] },)
+ lib.deployment.withPort(0, 'appdaemon', 5050)
+ lib.deployment.withProbe(0, '/')
+ lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('home-assistant-config-volume', '/config',))
+ lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('home-assistant-new-config-volume', '/new-config',))
+ lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('ha-secrets', '/root/set_ssh_keys.sh') + k.core.v1.volumeMount.withSubPath('set_ssh_keys.sh'))
+ lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new('ha-secrets', '/root/generate_secrets_yaml.sh') + k.core.v1.volumeMount.withSubPath('generate_secrets_yaml.sh'))
+ lib.deployment.withSecurityContext(0, { privileged: true, allowPrivilegeEscalation: true },)
+ lib.deployment.withEnvVars(0, [k.core.v1.envVar.fromSecretRef('HASS_TOKEN', 'home-assistant/token', 'secret-value'), k.core.v1.envVar.fromSecretRef('HASS_SERVER', 'home-assistant/url', 'secret-value')],)
+ lib.deployment.withPort(1, 'appdaemon', 5050)
+ lib.deployment.withVolumeMount(1, k.core.v1.volumeMount.new('home-assistant-config-volume', '/home-assistant',))
+ {
  'home-assistant-db-volume-pv-volume': k.core.v1.persistentVolume.new('home-assistant-db-volume-pv-volume')
                                        + k.core.v1.persistentVolume.metadata.withLabels([{ type: 'local' }],)
                                        + k.core.v1.persistentVolume.spec.withAccessModes('ReadWriteMany')
                                        + k.core.v1.persistentVolume.spec.withStorageClassName('manual')
                                        + k.core.v1.persistentVolume.spec.withCapacity('40Gi')
                                        + k.core.v1.persistentVolume.spec.hostPath.withPath('/mnt/data/home-assistant-postgres'),
  'home-assistant-db-volume-pv-claim': k.core.v1.persistentVolumeClaim.new('home-assistant-db-volume-pv-claim')
                                       + k.core.v1.persistentVolumeClaim.spec.withAccessModes('ReadWriteMany')
                                       + k.core.v1.persistentVolumeClaim.spec.withStorageClassName('manual')
                                       + k.core.v1.persistentVolumeClaim.spec.resources.withRequests({ storage: '40Gi' }),
  postgres: k.apps.v1.deployment.new(name='home-assistant-postgres', containers=[postgresContainer],)
            + k.apps.v1.deployment.spec.template.spec.withImagePullSecrets({ name: 'regcred' },)
            + k.apps.v1.deployment.spec.template.spec.withServiceAccount('app',)
            + k.core.v1.volume.fromPersistentVolumeClaim('home-assistant-db-volume', 'home-assistant-postgres-db volume-pv-claim'),
  'postgres-service': k.core.v1.service.new('home-assistant-postgres', { name: 'home-assistant-postgres' }, [{
    name: 'db',
    port: 5432,
    protocol: 'TCP',
    targetPort: 'db',
  }],),
}
