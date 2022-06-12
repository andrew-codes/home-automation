local secrets = import '../../../apps/secrets/dist/secrets.jsonnet';
local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

local configApplicatorInitContainerProperies = {
  env: [{ name: 'GIT_BRANCH', value: 'main' }, { name: 'CHECKOUT_PATH', value: 'apps/home-assistant/src' }, { name: 'REPOSITORY', value: 'https://github.com/' + std.extVar('repositoryOwner') + '/' + std.extVar('repositoryName') + '.git' }],
  volumeMounts: [k.core.v1.volumeMount.new('home-assistant', '/config')],
};

local haSecretsConfigMapData = {
  'set_ssh_keys.sh': '\n#!/usr/bin env sh\nmkdir -p /root/.ssh\necho -e "${HOME_ASSISTANT_SSH_KEY_PRIVATE}" > /root/.ssh/id_rsa\necho -e "${HOME_ASSISTANT_SSH_KEY_PUBLIC}" > /root/.ssh/id_rsa.pub\nchmod 0600 /root/.ssh/*',
  'generate_secrets_yaml.sh': '\n#!/usr/bin/env sh\necho "\nAPPDAEMON_PASSWORD: \\"${HOME_ASSISTANT_APPDAEMON_PASSWORD}\\"\nAPPDAEMON_URL: \\"${HOME_ASSISTANT_APPDAEMON_URL}\\"\nDOUBLE_TAKE_TOKEN: \\"${HOME_ASSISTANT_DOUBLE_TAKE_TOKEN}\\"\nELEVATION: \\"${HOME_ASSISTANT_ELEVATION}\\"\nGAMING_ROOM_GAMING_PC_IP: \\"${HOME_ASSISTANT_GAME_ROOM_GAMING_PC_IP}\\"\nGAMING_ROOM_GAMING_PC_MAC: \\"${HOME_ASSISTANT_GAME_ROOM_GAMING_PC_MAC}\\"\nGAMING_ROOM_MACHINE_USERNAME: \\"${HOME_ASSISTANT_GAME_ROOM_MACHINE_USERNAME}\\"\nGAMING_ROOM_NVIDIA_SHIELD_IP: \\"${HOME_ASSISTANT_GAME_ROON_NVIDIA_SHIELD_IP}\\"\nGAMING_ROOM_PLAYSTATION_5_IP: \\"${HOME_ASSISTANT_GAME_ROON_PLAYSTATION_5_IP}\\"\nGAMING_ROOM_TV_IP: \\"${HOME_ASSISTANT_GAME_ROON_TV_IP}\\"\nGAMING_ROOM_TV_MAC: \\"${HOME_ASSISTANT_GAME_ROON_TV_MAC}\\"\nGITHUB_RUNNER_AUTH_HEADER: \\"token ${HOME_ASSISTANT_GITHUB_TOKEN}\\"\nGOOGLE_CALENDAR_CLIENT_ID: \\"${HOME_ASSISTANT_GOOGLE_CALENDAR_CLIENT_ID}\\"\nGOOGLE_CALENDAR_CLIENT_SECRET: \\"${HOME_ASSISTANT_GOOGLE_CALENDAR_CLIENT_SECRET}\\"\nHA_TOKEN: \\"${HOME_ASSISTANT_TOKEN}\\"\nHA_URL: \\"${HOME_ASSISTANT_SERVER}\\"\nHOME_AUTOMATION_PRIVATE_SSH_KEY: \\"${HOME_ASSISTANT_SSH_KEY_PRIVATE}\\"\nHOME_AUTOMATION_PUBLIC_SSH_KEY: \\"${HOME_ASSISTANT_SSH_KEY_PUBLIC}\\"\nINFLUXDB_TOKEN: \\"${HOME_ASSISTANT_INFLUXDB_TOKEN}\\"\nJIRA_AUTHORIZATION_HEADER: \\"${HOME_ASSISTANT_JIRA_AUTHORIZATION_HEADER}\\"\nLATITUDE: \\"${HOME_ASSISTANT_LATITUDE}\\"\nLONGITUDE: \\"${HOME_ASSISTANT_LONGITUDE}\\"\nPOSTGRES_DB: \\"${HOME_ASSISTANT_POSTGRES_DB}\\"\nPOSTGRES_PASSWORD: \\"${HOME_ASSISTANT_POSTGRES_PASSWORD}\\"\nPOSTGRES_USER: \\"${HOME_ASSISTANT_POSTGRES_USERNAME}\\"\nROUTER_IP: \\"${UNIFI_IP}\\"\nSPOTCAST_DC: \\"${HOME_ASSISTANT_SPOTCAST_DC}\\"\nSPOTCAST_DC_2: \\"${HOME_ASSISTANT_SPOTCAST_DC_2}\\"\nSPOTCAST_KEY: \\"${HOME_ASSISTANT_SPOTCAST_KEY}\\"\nSPOTCAST_KEY_2: \\"${HOME_ASSISTANT_SPOTCAST_KEY_2}\\"\nSPOTIFY_CLIENT_ID: \\"${HOME_ASSISTANT_SPOTIFY_CLIENT_ID}\\"\nSPOTIFY_CLIENT_SECRET: \\"${HOME_ASSISTANT_SPOTIFY_CLIENT_SECRET}\\"\nTIME_ZONE: \\"${HOME_ASSISTANT_TIME_ZONE}\\"\nUNIFI_PASSWORD: \\"${UNIFI_PASSWORD}\\"\nUNIFI_USERNAME: \\"${UNIFI_USERNAME}\\"\nUNIT_SYSTEM: \\"${HOME_ASSISTANT_UNIT_SYSTEM}\\"\nWITHINGS_CLIENT_ID: \\"${HOME_ASSISTANT_WITHINGS_CLIENT_ID}\\"\nWITHINGS_CLIENT_SECRET: \\"${HOME_ASSISTANT_WITHINGS_CLIENT_SECRET}\\"\nMQTT_USERNAME: \\"${MQTT_USERNAME}\\"\nMQTT_PASSWORD: \\"${MQTT_PASSWORD}\\"\nTURN_OFF_GAMING_ROOM_GAMING_PC_COMMAND: \\"ssh -n -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no -i /root/.ssh/id_rsa ${HOME_ASSISTANT_GAME_ROOM_MACHINE_USERNAME}@${HOME_ASSISTANT_GAME_ROOM_GAMING_PC_IP} \\\\\\"C:\\\\\\Windows\\\\\\System32\\\\\\rundll32.exe powrprof.dll,SetSuspendState Standby\\\\\\"\\"\nDB_URL: \\"postgresql://${HOME_ASSISTANT_POSTGRES_USERNAME}:${HOME_ASSISTANT_POSTGRES_PASSWORD}@home-assistant-postgres:5432/${HOME_ASSISTANT_POSTGRES_DB}\\"\n"',
};

local deployment = lib.deployment.new(std.extVar('name'), std.extVar('image'), std.extVar('secrets'), std.extVar('port'), '8123')
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
                   + lib.deployment.withInitContainer('frigate-is-ready', 'curlimages/curl:latest', { command: ['sh'], args: ['-c', "timeout 10 curl --fail --insecure --silent --output /dev/null --write-out 'HTTP Code %{http_code}' 'http://frigate:5000' || exit 1"] })
                   + lib.deployment.withInitContainer('postgres-is-ready', 'postgres:13.3-alpine', { command: ['sh'], args: ['-c', 'until pg_isready -h home-assistant-postgres -p 5432; do echo waiting for database; sleep 2; done;'] })
                   + lib.deployment.withPersistentVolume('home-assistant')
                   + lib.deployment.withPersistentVolume('home-assistant-new-config')
                   + lib.deployment.withConfigMapVolume('ha-secrets')
                   + lib.deployment.withContainer('app-daemon', 'acockburn/appdaemon:dev', { command: ['sh'], args: ['-c', 'ln -s /home-assistant/appdaemon.yaml /conf/appdaemon.yaml && ln -s /home-assistant/apps /conf/apps && ln -s /home-assistant/dashboards /conf/dashboards && ln -s /home-assistant/secrets.yaml /conf/secrets.yaml && ./dockerStart.sh'] },)
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
local configMap = lib.volume.configMapVolume.new('ha-secrets', haSecretsConfigMapData);

haVolume + configMap + haVolumeNewConfig + postgresVolume + [postgresDeployment, postgresService] + std.objectValues(deployment)
