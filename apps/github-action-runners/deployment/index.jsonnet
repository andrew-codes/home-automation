local k = import 'github.com/jsonnet-libs/k8s-libsonnet/1.29/main.libsonnet';

[
  {
    apiVersion: 'actions.summerwind.dev/v1alpha1',
    kind: 'HorizontalRunnerAutoscaler',
    metadata: {
      name: 'runner-deployment-autoscaler' + std.extVar('name'),
    },
    spec: {
      scaleDownDelaySecondsAfterScaleOut: 60,
      scaleTargetRef: { name: 'github-action-runner-amd64' },
      minReplicas: 1,
      maxReplicas: 5,
      metrics:
        [{
          type: 'TotalNumberOfQueuedAndInProgressWorkflowRuns',
          repositoryNames: [std.extVar('repoName')],
        }],
    },
  },
  {
    apiVersion: 'actions.summerwind.dev/v1alpha1',
    kind: 'RunnerDeployment',
    metadata: {
      name: 'github-action-runner-amd64-' + std.extVar('name'),
    },
    spec: {
      template: {
        spec: {
          env: [{ name: 'DISABLE_RUNNER_UPDATE', value: 'true' }],
          labels: [std.extVar('name'), 'github-action-runner', 'self-hosted'],
          repository: std.extVar('repoName'),
          dockerEnabled: true,
          dockerdWithinRunnerContainer: false,
          imagePullSecrets: [
            {
              name: 'regcred',
            },
            {
              name: 'ghcr',
            },
          ],
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
