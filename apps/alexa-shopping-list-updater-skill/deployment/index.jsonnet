local k = import "github.com/jsonnet-libs/k8s-libsonnet/1.23/main.libsonnet";

local containerPort = 80;
local appContainer = k.core.v1.container.new(name="alexa-shopping-list-updater-skill", image="docker-registry:5000/alexa-shopping-list-updater-skill:latest")
    + k.core.v1.container.withImagePullPolicy("Always")
    + k.core.v1.container.withPorts({
      name: "alexa-http",
      containerPort: containerPort,
      protocol: "TCP",
    })
    + k.core.v1.container.withEnv([
    { name: "NODE_TLS_REJECT_UNAUTHORIZED", value: 0 },
    { name: "PORT", value: containerPort },
    { name: "DEBUG", value: "" },
    { name: "MQTT_HOST", value: "mqtt" },
    { name: "MQTT_PORT", value: "1883" },
    ]);
{
  "alexa-shopping-list-updater-skill-deployment": k.apps.v1.deployment.new(name="alexa-shopping-list-updater-skill", containers=[
    appContainer
  ]) 
  + k.apps.v1.deployment.spec.template.spec.withImagePullSecrets({name: "regcred"},)
  + k.apps.v1.deployment.spec.template.spec.withServiceAccount("app")
}