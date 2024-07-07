local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.29/main.libsonnet';

local ttsVolume = lib.volume.persistentNfsVolume.new('piper-data', '40Gi', std.extVar('nfsIp'), std.extVar('nfsUsername'), std.extVar('nfsPassword'))
;
local ttsContainer = k.core.v1.container.new(name='piper', image='rhasspy/wyoming-piper')
                     + k.core.v1.container.withImagePullPolicy('Always')
                     + k.core.v1.container.withPorts({
                       name: 'piper',
                       containerPort: 10200,
                       protocol: 'TCP',
                     },)
                     + { volumeMounts: [k.core.v1.volumeMount.new('piper-data', '/data')] }
                     + { args: ['--voice', 'en_US-hfc_female-medium', '--debug'] }
                     + k.core.v1.container.withEnv([
                       { name: 'TZ', value: 'America/New_York' },
                     ])
;
local ttsDeployment = k.apps.v1.deployment.new(name='piper', containers=[ttsContainer],)
                      + k.apps.v1.deployment.spec.template.spec.withImagePullSecrets({ name: 'regcred' },)
                      + k.apps.v1.deployment.spec.template.spec.withServiceAccount('app',)
                      + { spec+: { template+: { spec+: { volumes: [k.core.v1.volume.fromPersistentVolumeClaim('piper-data', 'piper-data-pvc')] } } } }
;
local ttsService = k.core.v1.service.new('piper', { name: 'piper' }, [{
  name: 'piper',
  port: 10200,
  protocol: 'TCP',
  targetPort: 'piper',
}],);


local sttVolume = lib.volume.persistentNfsVolume.new('whisper-data', '80Gi', std.extVar('nfsIp'), std.extVar('nfsUsername'), std.extVar('nfsPassword'))
;
local sttContainer = k.core.v1.container.new(name='whisper', image=std.extVar('whisperImage')) + k.core.v1.container.withImagePullPolicy('Always')
                     + k.core.v1.container.withPorts({
                       name: 'whisper',
                       containerPort: 10300,
                       protocol: 'TCP',
                     },)
                     + { volumeMounts: [k.core.v1.volumeMount.new('whisper-data', '/data')] }
                     + { args: ['--model', 'tiny-int8', '--language', 'en'] }
                     + k.core.v1.container.withEnv([
                       { name: 'TZ', value: 'America/New_York' },
                     ])
                     +
                     {
                       resources: {
                         limits: {
                           'nvidia.com/gpu': 1,
                         },
                       },
                     }
;
local sttDeployment = k.apps.v1.deployment.new(name='whisper', containers=[sttContainer],)
                      + k.apps.v1.deployment.spec.template.spec.withImagePullSecrets({ name: 'regcred' },)
                      + k.apps.v1.deployment.spec.template.spec.withServiceAccount('app',)
                      + { spec+: {
                        template+: {

                          spec+: {
                            runtimeClassName: 'nvidia',
                            // tolerations: [
                            // { key: 'nvidia.com/gpu', operator: 'Exists', effect: 'NoSchedule' },
                            // ],
                            volumes: [k.core.v1.volume.fromPersistentVolumeClaim('whisper-data', 'whisper-data-pvc')],
                          },
                        },
                      } }
;
local sttService = k.core.v1.service.new('whisper', { name: 'whisper' }, [{
  name: 'whisper',
  port: 10300,
  protocol: 'TCP',
  targetPort: 'whisper',
}],);

local wakeWordVolumeData = lib.volume.persistentNfsVolume.new('open-wake-word-data', '40Gi', std.extVar('nfsIp'), std.extVar('nfsUsername'), std.extVar('nfsPassword'))
;
local wakeWordVolumeCustom = lib.volume.persistentNfsVolume.new('open-wake-word-custom', '40Gi', std.extVar('nfsIp'), std.extVar('nfsUsername'), std.extVar('nfsPassword'))
;
local wakeWordContainer = k.core.v1.container.new(name='open-wake-word', image='rhasspy/wyoming-openwakeword')
                          + k.core.v1.container.withImagePullPolicy('Always')
                          + k.core.v1.container.withPorts({
                            name: 'open-wake-word',
                            containerPort: 10400,
                            protocol: 'TCP',
                          },)
                          + { volumeMounts: [k.core.v1.volumeMount.new('open-wake-word-data', '/data'), k.core.v1.volumeMount.new('open-wake-word-custom', '/custom')] }
                          + k.core.v1.container.withEnv([
                            { name: 'TZ', value: 'America/New_York' },
                          ])
                          + { args: ['--preload-model', 'alexa'] }
;
local wakeWordDeployment = k.apps.v1.deployment.new(name='open-wake-word', containers=[wakeWordContainer],)
                           + k.apps.v1.deployment.spec.template.spec.withImagePullSecrets({ name: 'regcred' },)
                           + k.apps.v1.deployment.spec.template.spec.withServiceAccount('app',)
                           + { spec+: { template+: { spec+: { volumes: [
                             k.core.v1.volume.fromPersistentVolumeClaim('open-wake-word-data', 'open-wake-word-data-pvc'),
                             k.core.v1.volume.fromPersistentVolumeClaim('open-wake-word-custom', 'open-wake-word-custom-pvc'),
                           ] } } } }
;
local wakeWordService = k.core.v1.service.new('open-wake-word', { name: 'open-wake-word' }, [{
  name: 'open-wake-word',
  port: 10400,
  protocol: 'TCP',
  targetPort: 'open-wake-word',
}],)
;


[]
+ ttsVolume + [ttsDeployment, ttsService]
+ sttVolume + [sttDeployment, sttService]
+ wakeWordVolumeData + wakeWordVolumeCustom + [wakeWordDeployment, wakeWordService]
