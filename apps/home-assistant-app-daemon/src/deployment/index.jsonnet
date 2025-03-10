local lib = import "../../../../packages/deployment-utils/dist/index.libsonnet";
local secrets = import "../../../secrets/src/secrets.jsonnet";
local k = import "github.com/jsonnet-libs/k8s-libsonnet/1.29/main.libsonnet";

local deployment = lib.deployment.new(std.extVar("name"), std.extVar("image"), std.extVar("secrets"), "30505", "5050")
                   + lib.deployment.withEnvVars(0, [
                     { name: "DEBUG", value: "" },
                     { name: "MQTT_HOST", value: "mqtt" },
                     { name: "MQTT_PORT", value: "1883" },
                     { name: "TOKEN", value: std.extVar("token") },
                     { name: "HA_URL", value: std.extVar("haUrl") },
                   ])
                   + lib.deployment.withPersistentVolume("home-assistant-app-daemon-config")
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new("home-assistant-app-daemon-config", "/conf",))
                   + lib.deployment.withPersistentVolume("home-assistant-config")
                   + lib.deployment.withVolumeMount(0, k.core.v1.volumeMount.new("home-assistant-config", "/config",))
                   + lib.deployment.withInitContainer("home-assistant-app-daemon-apps", std.extVar("registryScopeName") + "/home-automation-home-assistant-app-daemon-apps:latest", { command: ["sh"], args: ["-c", "rsync -tr --delete /opt/apps /conf"], volumeMounts: [{ name: "home-assistant-app-daemon-config", mountPath: "/conf" }] })
                   + lib.deployment.withProbe(0, "/")
;

local configVolume = lib.volume.persistentNfsVolume.new("home-assistant-app-daemon-config", "10Gi")
;


[]
+ configVolume
+ std.objectValues(deployment)
