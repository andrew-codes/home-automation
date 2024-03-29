local secrets = import '../../../apps/secrets/dist/secrets.jsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

{
  deployment+: {
    new(name, image, secretNames=[], externalPort='', containerPort='', disablePortEnv=false)::
      local exPort = if (containerPort != '') then { name: 'http', port: std.parseInt(containerPort), targetPort: 'http' }
                                                   + if (externalPort != '') then k.core.v1.servicePort.withNodePort(std.parseInt(externalPort)) else {} else {};
      local secretNamesCollection = std.split(secretNames, ',');
      local envSecrets = if (std.length(secretNames) > 0) then [
        secrets[secretName]
        for secretName in secretNamesCollection
      ] else [];
      local portEnv = if (containerPort != '' && !disablePortEnv) then [{ name: 'PORT', value: containerPort }] else [];
      local service = if (containerPort != '') then k.core.v1.service.new(name, { name: name }, [exPort])
                                                    + if (externalPort != '') then k.core.v1.service.spec.withType('NodePort',) else {} else {};

      local appContainer = k.core.v1.container.new(name=name, image=image)
                           + k.core.v1.container.withImagePullPolicy('Always')
                           + k.core.v1.container.withEnv(envSecrets + portEnv)
                           + if (containerPort != '') then k.core.v1.container.withPorts({
                             name: 'http',
                             containerPort: std.parseInt(containerPort),
                           }) else {};

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
                  k.core.v1.volume.fromPersistentVolumeClaim(name, name + '-pvc'),
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
      new(name, capacity)::
        [
          k.core.v1.persistentVolume.new(name + '-pv')
          + k.core.v1.persistentVolume.metadata.withLabels({ type: 'local' })
          + k.core.v1.persistentVolume.spec.withAccessModes('ReadWriteMany')
          + k.core.v1.persistentVolume.spec.withStorageClassName('manual')
          + k.core.v1.persistentVolume.spec.withCapacity({ storage: capacity })
          + k.core.v1.persistentVolume.spec.hostPath.withPath('/data/' + name),

          k.core.v1.persistentVolumeClaim.new(name + '-pvc')
          + k.core.v1.persistentVolumeClaim.spec.withAccessModes('ReadWriteMany')
          + k.core.v1.persistentVolumeClaim.spec.withStorageClassName('manual')
          + k.core.v1.persistentVolumeClaim.spec.resources.withRequests({ storage: capacity }),
        ],
    },

    persistentNfsVolume+: {
      new(name, capacity, ip, username, password)::
        [
          k.core.v1.persistentVolume.new(name + '-pv')
          + k.core.v1.persistentVolume.spec.withAccessModes('ReadWriteMany')
          + k.core.v1.persistentVolume.spec.withStorageClassName('nfs')
          + k.core.v1.persistentVolume.spec.withCapacity({ storage: capacity })
          + k.core.v1.persistentVolume.spec.nfs.withPath('/volume1/k8s-data/' + name)
          + k.core.v1.persistentVolume.spec.nfs.withServer(ip)
          + k.core.v1.persistentVolume.spec.nfs.withReadOnly(false)
          + k.core.v1.persistentVolume.spec.withMountOptions(['nfsvers=4.1'])
          + k.core.v1.persistentVolume.spec.withVolumeMode('Filesystem')
          + k.core.v1.persistentVolume.spec.withPersistentVolumeReclaimPolicy('Recycle'),

          k.core.v1.persistentVolumeClaim.new(name + '-pvc')
          + k.core.v1.persistentVolumeClaim.spec.withAccessModes('ReadWriteMany')
          + k.core.v1.persistentVolumeClaim.spec.withStorageClassName('nfs')
          + k.core.v1.persistentVolumeClaim.spec.resources.withRequests({ storage: capacity }),
        ],
    },
  },

  onePasswordSecrets+: {
    new(vaultId, k8sName, name)::
      {
        apiVersion: 'onepassword.com/v1',
        kind: 'OnePasswordItem',
        metadata: {
          name: k8sName,
        },
        spec: {
          itemPath: 'vaults/' + vaultId + '/items/' + name,
        },
      },
  },
}
