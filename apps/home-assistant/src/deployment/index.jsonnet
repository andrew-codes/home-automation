local secrets = import "../../../apps/secrets/src/secrets.jsonnet";
local lib = import "../../../packages/deployment-utils/dist/index.libsonnet";
local k = import "github.com/jsonnet-libs/k8s-libsonnet/1.29/main.libsonnet";

local deployment = lib.deployment.new(std.extVar("name"), std.extVar("image"), std.extVar("secrets"), "", "8123")
                   + lib.deployment.withEnvVars(0, [
                     { name: "DEBUG", value: "" },
                     { name: "MQTT_HOST", value: "mqtt" },
                     { name: "MQTT_PORT", value: "1883" },
                   ])
                   + lib.deployment.withInitContainer("mqtt-is-ready", std.extVar("registryHostname") + "/mqtt-client:latest", { env: [secrets["mqtt/username"], secrets["mqtt/password"]], command: ["sh"], args: ["-c", 'timeout 10 sub -h mqtt -t "\\$SYS/#" -C 1 -u $MQTT_USERNAME -P $MQTT_PASSWORD | grep -v Error || exit 1'] })
                   + lib.deployment.withPersistentVolume("home-assistant-config")
                   + lib.deployment.withProbe(0, "/")
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new("home-assistant-config", "/config",))
                   + lib.deployment.withSecurityContext(0, { privileged: true, allowPrivilegeEscalation: true },)
                   + lib.deployment.withEnvVars(0, [secrets["home-assistant/token"], secrets["home-assistant/server"]],)
                   + lib.deployment.withSecurityContext(0, { privileged: true, allowPrivilegeEscalation: true },)
                   + {
                     deployment+: {
                       spec+: {
                         template+: {
                           spec+: {
                             containers:
                               [super.containers[0] { volumeMounts+: [
                                 {
                                   name: "docker-env-empty-dir",
                                   mountPath: "/.dockerenv",
                                   subPath: ".dockerenv",
                                 },
                               ] }] + super.containers[1:],
                           },
                         },
                       },
                     },
                   }
                   + {
                     deployment+: {
                       spec+: {
                         template+: {
                           spec+: {
                             volumes+: [
                               {
                                 name: "docker-env-empty-dir",
                                 emptyDir: {},
                               },
                             ],
                           },
                         },
                       },
                     },
                   }
;
local haVolume = lib.volume.persistentNfsVolume.new("home-assistant-config", "10Gi")
;


// local espHomeConfigVolume = lib.volume.persistentNfsVolume.new('esphome-config', '10Gi', std.extVar('nfsIp'))
// ;
// local espGitConfigVolume = k.core.v1.configMap.new('esphome-gitconfig', { '.gitconfig': '[safe]\n        directory = *' })
// ;
// local espHomeContainer = k.core.v1.container.new(name='esphome', image='esphome/esphome:2024.3.0')
//                          + k.core.v1.container.withImagePullPolicy('Always')

//                          + { volumeMounts: [
//                            k.core.v1.volumeMount.new('esphome-config', '/config'),
//                            k.core.v1.volumeMount.new('esphome-gitconfig', '/root/.gitconfig') + k.core.v1.volumeMount.withSubPath('.gitconfig'),
//                          ] }
//                          + k.core.v1.container.withPorts({
//                            name: 'esphome',
//                            containerPort: 6052,
//                            protocol: 'TCP',
//                          },)
//                          + k.core.v1.container.withEnv([
//                            { name: 'TZ', value: 'America/New_York' },
//                          ])
// ;
// local espHomeDeployment = k.apps.v1.deployment.new(name='esphome', containers=[espHomeContainer],)
//                           + k.apps.v1.deployment.spec.template.spec.withImagePullSecrets({ name: 'regcred' },)
//                           + k.apps.v1.deployment.spec.template.spec.withServiceAccount('app',)
//                           + { spec+: { template+: { spec+: { volumes: [
//                             k.core.v1.volume.fromPersistentVolumeClaim('esphome-config', 'esphome-config-pvc'),
//                             {
//                               name: 'esphome-gitconfig',
//                               configMap: { name: 'esphome-gitconfig', defaultMode: 384 },
//                             },
//                           ] } } } }
//                           + {
//                             spec+: {
//                               template+: {
//                                 spec+: {
//                                   hostNetwork: true,
//                                   dnsPolicy: 'ClusterFirstWithHostNet',
//                                 },
//                               },
//                             },
//                           }
// ;

[]
+ std.objectValues(deployment)
+ haVolume
// + espHomeConfigVolume + [espHomeDeployment, espGitConfigVolume]
