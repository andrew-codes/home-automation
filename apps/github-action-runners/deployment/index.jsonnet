local lib = import '../../../packages/deployment-utils/dist/index.libsonnet';
local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.23/main.libsonnet';

{
  namespace: {
    apiVersion: 'v1',
    kind: 'Namespace',
    metadata: {
      name: 'actions-runner-system',
    },
  },
  clusterBinding: {
    kind: 'ClusterRoleBinding',
    apiVersion: 'rbac.authorization.k8s.io/v1',
    metadata: {
      name: 'k8s',
    },
    subjects: [{
      kind: 'ServiceAccount',
      name: 'k8s',
      namespace: 'default',
    }],
    roleRef: {
      kind: 'ClusterRole',
      name: 'cluster-admin',
      apiGroup: 'rbac.authorization.k8s.io',
    },
  },
  serviceAccount: {
    apiVersion: 'v1',
    kind: 'ServiceAccount',
    metadata: {
      name: 'k8s',
    },
  },
  horizontalRunner: {
    apiVersion: 'actions.summerwind.dev/v1alpha1',
    kind: 'HorizontalRunnerAutoscaler',
    metadata: {
      name: 'runner-deployment-autoscaler',
    },
    spec: {
      scaleDownDelaySecondsAfterScaleOut: '60',
      scaleTargetRef: { name: 'github-runner-deployment' },
      minReplicas: '1',
      maxReplicas: '5',
      metrics:
        [{
          type: 'TotalNumberOfQueuedAndInProgressWorkflowRuns',
          repositoryNames: [std.extVar('repository_name')],
        }],
    },
  },
  runnerDeployment: {
    apiVersion: 'actions.summerwind.dev/v1alpha1',
    kind: 'RunnerDeployment',
    metadata: {
      name: 'github-runner-deployment',
    },
    spec: {
      template: {
        spec: {
          serviceAccountName: 'k8s',
          repository: std.extVar('repository_name'),
          labels: ['amd64-runner', 'github-action-runner'],
          dockerEnabled: true,
          dockerdWithinRunnerContainer: false,
          imagePullSecrets: [{
            name: 'regcred',
          }],
          image: std.extVar('image'),
          resources: {
            requests: {
              'ephemeral-storage': '2Gi',
            },
            limits: {
              'ephemeral-storage': '4Gi',
            },
          },
          imagePullPolicy: 'Always',
          env:
            [
              {
                name: 'DOCKER_HOST',
                value: 'localhost:2736',
              },
            ],
          volumeMounts: [
            {
              name: 'ssh-volume',
              mountPath: '/root/.ssh',
            },
            {
              name: 'ssh-volume',
              mountPath: '/home/runner/.ssh',
            },
          ],
          volumes: [
            {
              name: 'ssh-volume',
              secret: {
                secretName: 'ssh',
                defaultMode: '0600',
                items: [
                  {
                    key: 'known_hosts',
                    path: 'known_hosts',
                  },
                  {
                    key: 'id_rsa',
                    path: 'id_rsa',
                  },
                ],
              },
            },
          ],
          affinity: {
            nodeAffinity: {
              requiredDuringSchedulingIgnoredDuringExecution: {
                nodeSelectorTerms: [{
                  matchExpressions: [
                    {
                      key: 'kubernetes.io/arch',
                      operator: 'In',
                      values: ['amd64'],
                    },
                  ],
                }],
              },
            },
          },

        },
      },
    },
  },
}
