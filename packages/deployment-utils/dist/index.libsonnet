local secrets = import '../../../apps/secrets/dist/index.jsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.23/main.libsonnet';

{
  deployment+: {
    newWithExternalPort(name, image, port, secretNames)::
      local externalPort = k.core.v1.servicePort.new(80, 'http')
                           + k.core.v1.servicePort.withNodePort(port)
                           + k.core.v1.servicePort.withProtocol('TCP');

      local envSecrets = [
        secrets[secretName]
        for secretName in secretNames
      ];

      local containerPort = 80;
      local appContainer = k.core.v1.container.new(name=name, image=image)
                           + k.core.v1.container.withImagePullPolicy('Always')
                           + k.core.v1.container.withPorts({
                             name: 'http',
                             containerPort: containerPort,
                             protocol: 'TCP',
                           },)
                           + k.core.v1.container.withEnv([
                             { name: 'PORT', value: containerPort },
                             { name: 'DEBUG', value: '' },
                           ] + envSecrets);
      {
        deployment: k.apps.v1.deployment.new(name=name, containers=[appContainer],)
                    + k.apps.v1.deployment.spec.template.spec.withImagePullSecrets({ name: 'regcred' },)
                    + k.apps.v1.deployment.spec.template.spec.withServiceAccount('app',),
        service: k.core.v1.service.new(name, { name: name }, [externalPort],)
                 + k.core.v1.service.spec.withType('NodePort',),
      },
    withEnvVar(containerIndex, envVar)::
      {
        deployment+: {
          spec+: {
            template+: {
              spec+: {
                containers: 
                    if containerIndex == 0 then [super.containers[0] { env+: [envVar] }] + super.containers[1:] else [super.containers[containerIndex-1:containerIndex] + [super.containers[0] { env+: [envVar] }] + super.containers[containerIndex+1:]]
              },
            },
          },
        },
      },
    withEnvVars(containerIndex, envVars)::
      local reduceEnvVars(acc, envVar) = (acc + self.withEnvVar(containerIndex, envVar));
      std.foldl(reduceEnvVars, envVars, {}),
    withVolumeMount(containerIndex, volumeMount)::
      {
        deployment+: {
          spec+: {
            template+: {
              spec+: {
                containers: 
                    if containerIndex == 0 then [super.containers[0] { volumeMounts+: [volumeMount] } ] + super.containers[1:] else [super.containers[containerIndex-1:containerIndex] + [super.containers[0] { volumeMounts+: [volumeMount] }] + super.containers[containerIndex+1:]]
              },
            },
          },
        },
      },
    withSecretVolume(name, secretName, mode="0777", items=[])::
      {
        deployment+: {
          spec+: {
            template+: {
              spec+: {
                volumes+: [
                    k.core.v1.volume.fromSecret(name, secretName)
                    + k.core.v1.volume.secret.withItems(items)
                    + k.core.v1.volume.secret.withDefaultMode(mode)
                ],
              },
            },
          },
        },
      },
    withPersistentVolume(name, capacity, path)::
      {
        [name+"-pv-volume"]: k.core.v1.persistentVolume.new(name)
        + k.core.v1.persistentVolume.metadata.withLabels([{type: "local"},],)
        + k.core.v1.persistentVolume.spec.withAccessModes("ReadWriteMany")
        + k.core.v1.persistentVolume.spec.withStorageClassName("manual")
        + k.core.v1.persistentVolume.spec.withCapacity(capacity)
        + k.core.v1.persistentVolume.spec.hostPath.withPath(path),
        [name+"pv-claim"]: k.core.v1.persistentVolumeClaim.new(name)
        + k.core.v1.persistentVolumeClaim.spec.withAccessModes("ReadWriteMany")
        + k.core.v1.persistentVolumeClaim.spec.withStorageClassName("manual")
        + k.core.v1.persistentVolumeClaim.spec.resources.withRequests({storage: capacity}),
        deployment+: {
          spec+: {
            template+: {
              spec+: {
                volumes+: [
                    k.core.v1.volume.fromPersistentVolumeClaim(name, name+"pv-claim")
                ],
              },
            },
          },
        },
      },
  },
}
