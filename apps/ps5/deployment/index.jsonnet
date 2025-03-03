local secrets = import "../../../apps/secrets/src/secrets.jsonnet";
local lib = import "../../../packages/deployment-utils/dist/index.libsonnet";
local k = import "github.com/jsonnet-libs/k8s-libsonnet/1.29/main.libsonnet";

local deployment = lib.deployment.new(std.extVar("name"), std.extVar("image"), std.extVar("secrets"), "", "8080")
                   + lib.deployment.withEnvVars(0, [
                     { name: "MQTT_HOST", value: "mqtt" },
                     { name: "MQTT_PORT", value: "1883" },
                     { name: "DEVICE_CHECK_INTERVAL", value: "5000" },
                     { name: "DEVICE_DISCOVERY_INTERVAL", value: "60000" },
                     { name: "ACCOUNT_CHECK_INTERVAL", value: "5000" },
                     { name: "FRONTEND_PORT", value: "8080" },
                     { name: "CREDENTIAL_STORAGE_PATH", value: "/config/credentials.json" },
                     { name: "DEBUG", value: "@ha:ps5:*" },
                     { name: "PSN_ACCOUNTS", value: std.extVar("psnAccounts") },
                   ])
                   + lib.deployment.withContainerAugmentation(0, {
                     command: ["sh"],
                     args: ["-c", "/app/run-standalone.sh"],
                   })
                   + lib.deployment.withHostNetwork()
                   + lib.deployment.withPersistentVolume("ps5-config")
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new("ps5-config", "/config",))
;

local configVolume = lib.volume.persistentNfsVolume.new("ps5-config", "1Gi")
;

[]
+ configVolume
+ std.objectValues(deployment)
