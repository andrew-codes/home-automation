local secrets = import '../../../apps/secrets/dist/secrets.jsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

{
  deployment+: {
    new(name, image, secretNames=[], externalPort='', containerPort='')::
      local exPort = if (containerPort != '') then { name: 'http', port: std.parseInt(containerPort), targetPort: 'http' }
                                                   + if (externalPort != '') then k.core.v1.servicePort.withNodePort(std.parseInt(externalPort)) else {} else {};
      local secretNamesCollection = std.split(secretNames, ',');
      local envSecrets = if (std.length(secretNames) > 0) then [
        secrets[secretName]
        for secretName in secretNamesCollection
      ] else [];
      local portEnv = if (containerPort != '') then [{ name: 'PORT', value: containerPort }] else [];
      local service = if (containerPort != '') then k.core.v1.service.new(name, { name: name }, [exPort])
                                                    + if (externalPort != '') then k.core.v1.service.spec.withType('NodePort',) else {} else {};

      local appContainer = k.core.v1.container.new(name=name, image=image)
                           + k.core.v1.container.withImagePullPolicy('Always')
                           + k.core.v1.container.withEnv(envSecrets + portEnv)
                           + if (containerPort != '') then k.core.v1.container.withPorts({
                             name: 'http',
                             containerPort: std.parseInt(containerPort),
                           }) else {}
                                   + { metadata: { annotations: {
                                     'co.elastic.logs/json.keys_under_root': true,
                                     'co.elastic.logs/json.overwrite_keys': true,
                                     'co.elastic.logs/json.add_error_key': true,
                                     'co.elastic.logs/json.expand_keys': true,
                                   } } };

      local deployment = {
        deployment: k.apps.v1.deployment.new(name=name, containers=[appContainer])
                    + k.apps.v1.deployment.spec.template.spec.withImagePullSecrets({ name: 'regcred' },)
                    + k.apps.v1.deployment.spec.template.spec.withServiceAccount('app',),
      };

      local output = if (containerPort != '') then
        deployment {
          service: service,
        } else deployment;

      output,

    withContainer(name, image, properties={},)::
      local container = k.core.v1.container.new(name=name, image=image)
                        + k.core.v1.container.withImagePullPolicy('Always')
                        + properties;
      {
        deployment+: {
          spec+: {
            template+: {
              spec+: {
                containers: super.containers + [
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
                containers: if containerIndex == 0 then [super.containers[0] + augmentation] + super.containers[1:] else super.containers[0:containerIndex] + [super.containers[containerIndex] + augmentation] + if (std.length(super.containers) > containerIndex + 1) then super.containers[containerIndex + 1:] else [],
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
                containers: if containerIndex == 0 then [super.containers[0] + augmentation] + super.containers[1:] else super.containers[0:containerIndex] + [super.containers[containerIndex] + augmentation] + if (std.length(super.containers) > containerIndex + 1) then super.containers[containerIndex + 1:] else [],
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
              spec+: {
                affinity: affinity,
              },
            },
          },
        },
      },

    withPort(containerIndex, appName, name, containerPort, externalPort='')::
      local servicePort = { name: name, port: containerPort, targetPort: name }
                          + if (externalPort != '') then k.core.v1.servicePort.withNodePort(std.parseInt(externalPort)) else {};

      {
        deployment+: {
          spec+: {
            template+: {
              spec+: {
                containers: if containerIndex == 0 then [super.containers[0] { ports+: [{ name: name, containerPort: containerPort }] }] + super.containers[1:] else super.containers[0:containerIndex] + [super.containers[containerIndex] { ports+: [{ name: name, containerPort: containerPort }] }] + if (std.length(super.containers) > containerIndex + 1) then super.containers[containerIndex + 1:] else [],
              },
            },
          },
        },
        ['service' + name]: k.core.v1.service.new(name, { name: appName }, [servicePort])
                            + if (externalPort != '') then k.core.v1.service.spec.withType('NodePort',) else {},
      },

    withSecurityContext(containerIndex, securityContext)::
      {
        deployment+: {
          spec+: {
            template+: {
              spec+: {
                containers: if containerIndex == 0 then [super.containers[0] { securityContext+: securityContext }] + super.containers[1:] else super.containers[0:containerIndex] + [super.containers[containerIndex] { securityContext+: securityContext }] + if (std.length(super.containers) > containerIndex + 1) then super.containers[containerIndex + 1:] else [],
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
                  if containerIndex == 0 then [super.containers[0] { env+: [envVar] }] + super.containers[1:] else super.containers[0:containerIndex] + [super.containers[containerIndex] { env+: [envVar] }] + if (std.length(super.containers) > containerIndex + 1) then super.containers[containerIndex + 1:] else [],
              },
            },
          },
        },
      },

    withEnvVars(containerIndex, envVars)::
      {
        deployment+: {
          spec+: {
            template+: {
              spec+: {
                containers:
                  if containerIndex == 0 then [super.containers[0] { env+: envVars }] + super.containers[1:] else super.containers[0:containerIndex] + [super.containers[containerIndex] { env+: envVars }] + if (std.length(super.containers) > containerIndex + 1) then super.containers[containerIndex + 1:] else [],
              },
            },
          },
        },
      },

    withVolumeMount(containerIndex, volumeMount)::
      {
        deployment+: {
          spec+: {
            template+: {
              spec+: {
                containers:
                  if containerIndex == 0 then [super.containers[0] { volumeMounts+: [volumeMount] }] + super.containers[1:] else super.containers[0:containerIndex] + [super.containers[containerIndex] { volumeMounts+: [volumeMount] }] + if (std.length(super.containers) > containerIndex + 1) then super.containers[containerIndex + 1:] else [],
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

    withConfigMapVolume(name, defaultMode=384)::
      {
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

    withPersistentVolume(name)::
      {
        deployment+: {
          spec+: {
            template+: {
              spec+: {
                volumes+: [
                  k.core.v1.volume.fromPersistentVolumeClaim(name, name + '-pv-claim'),
                ],
              },
            },
          },
        },
      },
  },

  volume+: {
    configMapVolume+: {
      new(name, data={})::
        [
          k.core.v1.configMap.new(name) + k.core.v1.configMap.withData(data),
        ],
    },

    persistentVolume+: {
      new(name, capacity, path)::
        [
          k.core.v1.persistentVolume.new(name + '-pv-volume')
          + k.core.v1.persistentVolume.metadata.withLabels({ type: 'local' })
          + k.core.v1.persistentVolume.spec.withAccessModes('ReadWriteMany')
          + k.core.v1.persistentVolume.spec.withStorageClassName('manual')
          + k.core.v1.persistentVolume.spec.withCapacity({ storage: capacity })
          + k.core.v1.persistentVolume.spec.hostPath.withPath(path),

          k.core.v1.persistentVolumeClaim.new(name + '-pv-claim')
          + k.core.v1.persistentVolumeClaim.spec.withAccessModes('ReadWriteMany')
          + k.core.v1.persistentVolumeClaim.spec.withStorageClassName('manual')
          + k.core.v1.persistentVolumeClaim.spec.resources.withRequests({ storage: capacity }),
        ],
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
              name: k8sName,
              type: 'secret',
            },
          },
          output: { secret: { name: k8sName, dataKey: 'secret-value' } },
        },
      },
  },
}
