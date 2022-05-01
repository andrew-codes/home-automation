local grafonnet = import 'github.com/grafana/grafonnet-lib/grafonnet/grafana.libsonnet';
local dashboard = grafonnet.dashboard;
local row = grafonnet.row;
local prometheus = grafonnet.prometheus;
local template = grafonnet.template;
local graphPanel = grafonnet.graphPanel;

local grafana = import 'grafana/grafana.libsonnet';

{
  _config:: {
    namespace: 'monitoring',
    version: '8.5.1',
    image: 'grafana/grafana:8.5.1',
    datasource: [{
      name: 'prometheus',
      type: 'prometheus',
      access: 'proxy',
      orgId: 1,
      url: 'http://prometheus-k8s.monitoring.svc:9090',
      version: 1,
      editable: false,
    }],
    dashboards+: {
      'my-dashboard.json':
        dashboard.new('My Dashboard')
        .addTemplate(
          {
            current: {
              text: 'Prometheus',
              value: 'Prometheus',
            },
            hide: 0,
            label: null,
            name: 'datasource',
            options: [],
            query: 'prometheus',
            refresh: 1,
            regex: '',
            type: 'datasource',
          },
        )
        .addRow(
          row.new()
          .addPanel(
            graphPanel.new('My Panel', span=6, datasource='$datasource')
            .addTarget(prometheus.target('vector(1)')),
          )
        ),
    },
  },

  grafana: grafana($._config) + {
    service+: {
      spec+: {
        ports: [
          {
            name: 'http',
            port: 3000,
            targetPort: 'http',
            nodePort: std.extVar('EXTERNAL_GRAFANA_PORT'),
          }
          for port in super.ports
        ],
      },
    },
  },
}
