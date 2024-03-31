local secrets = import "../../../apps/secrets/dist/secrets.jsonnet";
local lib = import "../../../packages/deployment-utils/dist/index.libsonnet";
local k = import "github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet";

local deployment = lib.deployment.new(std.extVar("name"), std.extVar("image"), std.extVar("secrets"), std.extVar("port"), "8091")
                   + lib.deployment.withEnvVars(0, [
                     { name: "DEBUG", value: "" },
                     { name: "MQTT_HOST", value: "mqtt" },
                     { name: "MQTT_PORT", value: "1883" },
                   ])
                   + lib.deployment.withInitContainer("mqtt-is-ready", std.extVar("registryHostname") + "/mqtt-client:latest", { env: [secrets["mqtt/username"], secrets["mqtt/password"]], command: ["sh"], args: ["-c", 'timeout 10 sub -h mqtt -t "\\$SYS/#" -C 1 -u $MQTT_USERNAME -P $MQTT_PASSWORD | grep -v Error || exit 1'] })
                   + lib.deployment.withSecurityContext(0, { privileged: true, allowPrivilegeEscalation: true },)
                   + lib.deployment.withPort(0, std.extVar("name"), "ws", 3000, std.extVar("wsPort"))
                   + lib.deployment.withPersistentVolume("zwave")
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new("zwave", "/usr/src/app/store",))
                   + lib.deployment.withAffinity({
                     nodeAffinity: {
                       requiredDuringSchedulingIgnoredDuringExecution: {
                         nodeSelectorTerms: [
                           { matchExpressions: [{ key: "kubernetes.io/hostname", operator: "In", values: ["k8s-node-2"] }] },
                         ],
                       },
                     },
                   },)
;

local pvc = lib.volume.persistentNfsVolume.new("zwave", "5Gi", std.extVar("nfsIp"), std.extVar("nfsUsername"), std.extVar("nfsPassword"))
;

pvc + std.objectValues(deployment)
