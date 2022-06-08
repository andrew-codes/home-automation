local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local secrets = import '../../secrets/dist/index.jsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.23/main.libsonnet';

local configApplicatorInitContainerProperies = {
  env: [{ name: 'GIT_BRANCH', value: 'main' }, { name: 'CHECKOUT_PATH', value: 'apps/home-assistant/src' }, { name: 'REPOSITORY', value: 'https://github.com/' + std.extVar('repositoryOwner') + '/' + std.extVar('repositoryName') + '.git' }],
  volumeMounts: [{ name: 'home-assistant-config-volume', value: '/config' }, { name: 'home-assistant-new-config-volume', value: '/new-config' }],
};

local haSecretsConfigMapData = {
  'set_ssh_keys.sh': '\n#!/usr/bin env sh\nmkdir -p /root/.ssh\necho -e "${HOME_AUTOMATION_PRIVATE_SSH_KEY}" > /root/.ssh/id_rsa\necho -e "${HOME_AUTOMATION_PUBLIC_SSH_KEY}" > /root/.ssh/id_rsa.pub\nchmod 0600 /root/.ssh/*',
  'generate_secrets_yaml.sh:': "
#!/usr/bin env sh
echo \"
APPDAEMON_PASSWORD: '${APPDAEMON_PASSWORD}'
APPDAEMON_URL: '${APPDAEMON_URL}'
DOUBLE_TAKE_TOKEN: '${DOUBLE_TAKE_TOKEN}'
ELEVATION: '${ELEVATION}'
GAMING_ROOM_GAMING_PC_IP: '${GAMING_ROOM_GAMING_PC_IP}'
GAMING_ROOM_GAMING_PC_MAC: '${GAMING_ROOM_GAMING_PC_MAC}'
GAMING_ROOM_MACHINE_USERNAME: '${GAMING_ROOM_MACHINE_USERNAME}'
GAMING_ROOM_NVIDIA_SHIELD_IP: '${GAMING_ROOM_NVIDIA_SHIELD_IP}'
GAMING_ROOM_PLAYSTATION_5_IP: '${GAMING_ROOM_PLAYSTATION_5_IP}'
GAMING_ROOM_TV_IP: '${GAMING_ROOM_TV_IP}'
GAMING_ROOM_TV_MAC: '${GAMING_ROOM_TV_MAC}'
GITHUB_RUNNER_AUTH_HEADER: 'token ${GITHUB_RUNNER_TOKEN}'
GOOGLE_CALENDAR_CLIENT_ID: '${GOOGLE_CALENDAR_CLIENT_ID}'
GOOGLE_CALENDAR_CLIENT_SECRET: '${GOOGLE_CALENDAR_CLIENT_SECRET}'
HA_TOKEN: '${HA_TOKEN}'
HA_URL: '${HA_URL}'
HOME_AUTOMATION_PRIVATE_SSH_KEY: '${HOME_AUTOMATION_PRIVATE_SSH_KEY}'
HOME_AUTOMATION_PUBLIC_SSH_KEY: '${HOME_AUTOMATION_PUBLIC_SSH_KEY}'
INFLUXDB_TOKEN: '${INFLUXDB_TOKEN}'
JIRA_AUTHORIZATION_HEADER: '${JIRA_AUTHORIZATION_HEADER}'
LATITUDE: '${LATITUDE}'
LONGITUDE: '${LONGITUDE}'
POSTGRES_DB: '${POSTGRES_DB}'
POSTGRES_PASSWORD: '${POSTGRES_PASSWORD}'
POSTGRES_USER: '${POSTGRES_USER}'
ROUTER_IP: '${ROUTER_IP}'
SPOTCAST_DC: '${SPOTCAST_DC}'
SPOTCAST_DC_2: '${SPOTCAST_DC_2}'
SPOTCAST_KEY: '${SPOTCAST_KEY}'
SPOTCAST_KEY_2: '${SPOTCAST_KEY_2}'
SPOTIFY_CLIENT_ID: '${SPOTIFY_CLIENT_ID}'
SPOTIFY_CLIENT_SECRET: '${SPOTIFY_CLIENT_SECRET}'
TIME_ZONE: '${TIME_ZONE}'
UNIFI_PASSWORD: '${UNIFI_PASSWORD}'
UNIFI_USERNAME: '${UNIFI_USERNAME}'
UNIT_SYSTEM: '${UNIT_SYSTEM}'
WITHINGS_CLIENT_ID: '${WITHINGS_CLIENT_ID}'
WITHINGS_CLIENT_SECRET: '${WITHINGS_CLIENT_SECRET}'
MQTT_USERNAME: '${MQTT_USERNAME}'
MQTT_PASSWORD: '${MQTT_PASSWORD}'
TURN_OFF_GAMING_ROOM_GAMING_PC_COMMAND: 'ssh -n -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -i /root/.ssh/id_rsa ${GAMING_ROOM_MACHINE_USERNAME}@${GAMING_ROOM_GAMING_PC_IP} \\\"C:\\Windows\\System32\\rundll32.exe powrprof.dll,SetSuspendState Standby\\\"'
DB_URL: 'postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@home-assistant-postgres:5432/${POSTGRES_DB}'
\"",
};

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
+ lib.deployment.withSecurityContext(0, { privileged: true, allowPrivilegeEscalation: true },)
+ lib.deployment.withEnvVars(0, [k.core.v1.envVar.fromSecretRef('HASS_TOKEN', 'home-assistant/token', 'secret-value'), k.core.v1.envVar.fromSecretRef('HASS_SERVER', 'home-assistant/url', 'secret-value')],)
+ lib.deployment.withPort(1, 'appdaemon', 5050)
+ lib.deployment.withVolumeMount(1, k.core.v1.volumeMount.new('home-assistant-config-volume', '/home-assistant',))
