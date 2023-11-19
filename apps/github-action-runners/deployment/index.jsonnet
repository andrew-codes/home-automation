local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.24/main.libsonnet';

[
  {
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
  {
    apiVersion: 'v1',
    kind: 'ServiceAccount',
    metadata: {
      name: 'k8s',
    },
  },
  {
    apiVersion: 'actions.summerwind.dev/v1alpha1',
    kind: 'HorizontalRunnerAutoscaler',
    metadata: {
      name: 'runner-deployment-autoscaler',
    },
    spec: {
      scaleDownDelaySecondsAfterScaleOut: 60,
      scaleTargetRef: { name: 'github-action-runner-amd64' },
      minReplicas: 1,
      maxReplicas: 5,
      metrics:
        [{
          type: 'TotalNumberOfQueuedAndInProgressWorkflowRuns',
          repositoryNames: [std.extVar('repository_names')],
        }],
    },
  },
  {
    apiVersion: 'actions.summerwind.dev/v1alpha1',
    kind: 'RunnerDeployment',
    metadata: {
      name: 'github-action-runner-amd64',
    },
    spec: {
      template: {
        spec: {
          serviceAccountName: 'k8s',
          organization: std.extVar('org'),
          labels: ['amd64-runner', 'github-action-runner'],
          dockerEnabled: true,
          dockerdWithinRunnerContainer: false,
          imagePullSecrets: [{
            name: 'regcred',
          }],
          securityContext: {
            fsGroup: 1001,
            fsGroupChangePolicy: 'Always',
          },
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
                defaultMode: 384,
                items: [
                  {
                    key: 'id_rsa',
                    path: 'id_rsa',
                  },
                  {
                    key: 'config',
                    path: 'config',
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
]
