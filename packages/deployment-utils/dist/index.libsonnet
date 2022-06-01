local k = import "github.com/jsonnet-libs/k8s-libsonnet/1.23/main.libsonnet";
local secrets = import "../../../apps/secrets/dist/index.jsonnet";

{
    deployment+: {
        newWithExternalPort(name, image, port, secretNames)::
            local externalPort = k.core.v1.servicePort.new(80, "http")
            + k.core.v1.servicePort.withNodePort(port)
            + k.core.v1.servicePort.withProtocol("TCP");

            local containerPort = 80;
            local appContainer = k.core.v1.container.new(name=name, image=image)
                + k.core.v1.container.withImagePullPolicy("Always")
                + k.core.v1.container.withPorts({
                    name: "http",
                    containerPort: containerPort,
                    protocol: "TCP",
                },)
                + k.core.v1.container.withEnv([
                    { name: "PORT", value: containerPort },
                    { name: "DEBUG", value: "" },
                ],);
            {
                deployment: k.apps.v1.deployment.new(name=name, containers=[appContainer],) 
                    + k.apps.v1.deployment.spec.template.spec.withImagePullSecrets({name: "regcred",},)
                    + k.apps.v1.deployment.spec.template.spec.withServiceAccount("app",)
                    + [
                        k.core.v1.container.withEnv(secrets[secretName])
                        for secretName in secretNames
                    ],
                service: k.core.v1.service.new(name, {name: name,}, [externalPort,],)
                    + k.core.v1.service.spec.withType('NodePort',)
            }
    }
}