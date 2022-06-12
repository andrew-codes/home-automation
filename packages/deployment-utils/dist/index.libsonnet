local secrets = import '../../../apps/secrets/dist/secrets.jsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.23/main.libsonnet';

{
  deployment+: {
    new(name, image, secretNames=[], externalPort='', containerPort=80)::
      local exPort = k.core.v1.servicePort.new(80, 'http')
                     + if (externalPort != '') then k.core.v1.servicePort.withNodePort(externalPort) else {}
                                                                                                          + k.core.v1.servicePort.withProtocol('TCP');

      local envSecrets = [
        secrets[secretName]
        for secretName in secretNames
      ];

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
        service: k.core.v1.service.new(name, { name: name }, [exPort],)
                 + if (externalPort != '') then k.core.v1.service.spec.withType('NodePort',) else {},
      },

    withContainer(name, image, properties={},)::
      local container = k.core.v1.container.new(name=name, image=image)
                        + k.core.v1.container.withImagePullPolicy('Always')
                        + properties;
      {
        deployment+: {
          spec+: {
            template+: {
              spec+: {
                containers+: [
                  container,
                ],
              },
            },
          },
        },
      },

    withHostNetwork()::
      {
        deployment+: {
          spec+: {
            template+: {
              spec+: {
                hostNetwork: true,
                dnsPolicy: 'ClusterFirstWithHostNet',
              },
            },
          },
        },
      },

    withProbe(containerIndex, path, portName='http')::
      local augmentation = {
        livenessProbe: {
          httpGet:
            {
              path: path,
              port: portName,
              scheme: 'HTTP',
            },
          initialDelaySeconds: 60,
          failureThreshold: 5,
          timeoutSeconds: 10,
        },
        readinessProbe: {
          httpGet:
            {
              path: path,
              port: portName,
              scheme: 'HTTP',
            },
          initialDelaySeconds: 60,
          failureThreshold: 5,
          timeoutSeconds: 10,
        },
        startupProbe: {
          httpGet:
            {
              path: path,
              port: portName,
              scheme: 'HTTP',
            },
          failureThreshold: 30,
          periodSeconds: 10,
        },
      };

      {
        deployment+: {
          spec+: {
            template+: {
              spec+: {
                containers+: if containerIndex == 0 then [super.containers[0] + augmentation] + super.containers[1:] else [super.containers[containerIndex - 1:containerIndex] + [super.containers[0] + augmentation]],
              },
            },
          },
        },
      },

    withContainerAugmentation(containerIndex, augmentation={})::
      {
        deployment+: {
          spec+: {
            template+: {
              spec+: {
                containers+: if containerIndex == 0 then [super.containers[0] + augmentation] + super.containers[1:] else [super.containers[containerIndex - 1:containerIndex] + [super.containers[0] + augmentation]],
              },
            },
          },
        },
      },

    withAffinity(affinity={},)::
      {
        deployment+: {
          spec+: {
            template+: {
              spec+: affinity,
            },
          },
        },
      },

    withPort(containerIndex, name, containerPort, externalPort='')::
      {
        deployment+: {
          spec+: {
            template+: {
              spec+: {
                containers+: if containerIndex == 0 then [super.containers[0] + k.core.v1.container.withPorts({
                  name: name,
                  containerPort: containerPort,
                  protocol: 'TCP',
                },)] + super.containers[1:] else [super.containers[containerIndex - 1:containerIndex] + [super.containers[0] + k.core.v1.container.withPorts({
                  name: name,
                  containerPort: containerPort,
                  protocol: 'TCP',
                },)] + super.containers[containerIndex + 1:]],
              },
            },
          },
        },
        service+: {
          spec+: {
            ports+: [{ name: name, port: containerPort, protocol: 'TCP', targetPort: name } + if (externalPort != '') then { nodePort: externalPort } else {}],
          },
        },
      },

    withSecurityContext(containerIndex, securityContext)::
      {
        deployment+: {
          spec+: {
            template+: {
              spec+: {
                containers+: if containerIndex == 0 then [super.containers[0] { securityContext+: securityContext }] + super.containers[1:] else [super.containers[containerIndex - 1:containerIndex] + [super.containers[0] { securityContext+: securityContext }] + super.containers[containerIndex + 1:]],
              },
            },
          },
        },
      },

    withInitContainer(name, image, containerProperties={},)::
      {
        deployment+: {
          spec+: {
            template+: {
              spec+: {
                initContainers+: [{ name: name, image: image, imagePullPolicy: 'Always' } + containerProperties],
              },
            },
          },
        },
      },
    withEnvVar(containerIndex, envVar)::
      {
        deployment+: {
          spec+: {
            template+: {
              spec+: {
                containers:
                  if containerIndex == 0 then [super.containers[0] { env+: [envVar] }] + super.containers[1:] else [super.containers[containerIndex - 1:containerIndex] + [super.containers[0] { env+: [envVar] }] + super.containers[containerIndex + 1:]],
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
                  if containerIndex == 0 then [super.containers[0] { volumeMounts+: [volumeMount] }] + super.containers[1:] else [super.containers[containerIndex - 1:containerIndex] + [super.containers[0] { volumeMounts+: [volumeMount] }] + super.containers[containerIndex + 1:]],
              },
            },
          },
        },
      },

    withSecretVolume(name, secretName, mode=511, items=[])::
      {
        deployment+: {
          spec+: {
            template+: {
              spec+: {
                volumes+: [
                  k.core.v1.volume.fromSecret(name, secretName)
                  + k.core.v1.volume.secret.withItems(items)
                  + k.core.v1.volume.secret.withDefaultMode(mode),
                ],
              },
            },
          },
        },
      },

    withConfigMapVolume(name, dataItems=[], defaultMode=384)::
      {
        [name]: k.core.v1.configMap(name, dataItems),
        deployment+: {
          spec+: {
            template+: {
              spec+: {
                volumes+: [
                  {
                    name: name,
                    configMap: { name: name, defaultMode: defaultMode },
                  },
                ],
              },
            },
          },
        },
      },

    withPersistentVolume(name, capacity, path)::
      {
        [name + '-pv-volume']: k.core.v1.persistentVolume.new(name)
                               + k.core.v1.persistentVolume.metadata.withLabels([{ type: 'local' }],)
                               + k.core.v1.persistentVolume.spec.withAccessModes('ReadWriteMany')
                               + k.core.v1.persistentVolume.spec.withStorageClassName('manual')
                               + k.core.v1.persistentVolume.spec.withCapacity(capacity)
                               + k.core.v1.persistentVolume.spec.hostPath.withPath(path),
        [name + 'pv-claim']: k.core.v1.persistentVolumeClaim.new(name)
                             + k.core.v1.persistentVolumeClaim.spec.withAccessModes('ReadWriteMany')
                             + k.core.v1.persistentVolumeClaim.spec.withStorageClassName('manual')
                             + k.core.v1.persistentVolumeClaim.spec.resources.withRequests({ storage: capacity }),
        deployment+: {
          spec+: {
            template+: {
              spec+: {
                volumes+: [
                  k.core.v1.volume.fromPersistentVolumeClaim(name, name + 'pv-claim'),
                ],
              },
            },
          },
        },
      },
  },

  akvSecrets+: {
    new(kvName, k8sName, name)::
      {
        apiVersion: 'spv.no/v2beta1',
        kind: 'AzureKeyVaultSecret',
        metadata: {
          name: k8sName,
        },
        spec: {
          vault: {
            name: kvName,
            object: {
              name: name,
              type: 'secret',
            },
          },
          output: { secret: { name: k8sName, dataKey: 'secret-value' } },
        },
      },
  },
}
