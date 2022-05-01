local grafonnet = import 'github.com/grafana/grafonnet-lib/grafonnet/grafana.libsonnet';
local g = import 'github.com/grafana/jsonnet-libs/grafana-builder/grafana.libsonnet';
local dashboard = grafonnet.dashboard;
local row = grafonnet.row;
local prometheus = grafonnet.prometheus;
local template = grafonnet.template;
local graphPanel = grafonnet.graphPanel;

local grafana = import 'grafana/grafana.libsonnet';

{
  _config+:: {
    clusterLabel: 'cluster',
    cadvisorSelector: 'job="cadvisor"',
    kubeletSelector: 'job="kubelet"',
    kubeStateMetricsSelector: 'job="kube-state-metrics"',
    nodeExporterSelector: 'job="node-exporter"',
    kubeSchedulerSelector: 'job="kube-scheduler"',
    kubeControllerManagerSelector: 'job="kube-controller-manager"',
    kubeApiserverSelector: 'job="kube-apiserver"',
    kubeProxySelector: 'job="kube-proxy"',
    podLabel: 'pod',
    hostNetworkInterfaceSelector: 'device!~"veth.+"',
    hostMountpointSelector: 'mountpoint="/"',
    windowsExporterSelector: 'job="kubernetes-windows-exporter"',
    containerfsSelector: 'container!=""',
  },
  grafanaDashboards+:: {
    'test-dashboard.json':
      local dataSourceTemplate = template.new(
        name='datasource',
        datasource='$datasource',
        query='prometheus',
        current='prometheus',
        refresh=2,
        includeAll=false,
        sort=1
      );
      local clusterTemplate =
        template.new(
          name='cluster',
          datasource='$datasource',
          query='label_values(up{%(kubeStateMetricsSelector)s}, %(clusterLabel)s)' % $._config,
          current='',
          refresh=2,
          includeAll=false,
          sort=1
        );

      local namespaceTemplate =
        template.new(
          name='namespace',
          datasource='$datasource',
          query='label_values(kube_namespace_status_phase{%(kubeStateMetricsSelector)s, %(clusterLabel)s="$cluster"}, namespace)' % $._config,
          current='',
          hide='',
          refresh=2,
          includeAll=false,
          multi=false,
          sort=1
        );

      local podTemplate =
        template.new(
          name='pod',
          datasource='$datasource',
          query='label_values(kube_pod_info{%(kubeStateMetricsSelector)s, %(clusterLabel)s="$cluster", namespace="$namespace"}, pod)' % $._config,
          current='',
          hide='',
          refresh=2,
          includeAll=false,
          sort=1
        );

      local cpuRequestsQuery = |||
        sum(
            kube_pod_container_resource_requests{%(kubeStateMetricsSelector)s, %(clusterLabel)s="$cluster", namespace="$namespace", pod="$pod", resource="cpu"}
        )
      ||| % $._config;
      local cpuLimitsQuery = std.strReplace(cpuRequestsQuery, 'requests', 'limits');
      local memRequestsQuery = std.strReplace(cpuRequestsQuery, 'cpu', 'memory');
      local memLimitsQuery = std.strReplace(cpuLimitsQuery, 'cpu', 'memory');

      dashboard.new('Test Dashboard')
      .addRow(
        row.new()
        .addPanel(
          graphPanel.new('My Panel', span=6, datasource='$datasource')
          .addTarget(prometheus.target('vector(1)')),
        )
      )
      .addRow(
        g.row('CPU Usage')
        .addPanel(
          g.panel('CPU Usage') +
          g.queryPanel(
            [
              'sum(node_namespace_pod_container:container_cpu_usage_seconds_total:sum_irate{namespace="$namespace", pod="$pod", %(clusterLabel)s="$cluster"}) by (container)' % $._config,
              cpuRequestsQuery,
              cpuLimitsQuery,
            ], [
              '{{container}}',
              'requests',
              'limits',
            ],
          ) +
          g.stack + {
            seriesOverrides: [
              {
                alias: 'requests',
                color: '#F2495C',
                fill: 0,
                hideTooltip: true,
                legend: true,
                linewidth: 2,
                stack: false,
              },
              {
                alias: 'limits',
                color: '#FF9830',
                fill: 0,
                hideTooltip: true,
                legend: true,
                linewidth: 2,
                stack: false,
              },
            ],
          },
        )
      ) + {
        templating+: {
          list+: [dataSourceTemplate, clusterTemplate, namespaceTemplate, podTemplate],
        },
      },
  },
}
