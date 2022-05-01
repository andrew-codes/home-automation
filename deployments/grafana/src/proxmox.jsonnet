local grafonnet = import 'github.com/grafana/grafonnet-lib/grafonnet/grafana.libsonnet';
local g = import 'github.com/grafana/jsonnet-libs/grafana-builder/grafana.libsonnet';
local dashboard = grafonnet.dashboard;
local row = grafonnet.row;
local template = grafonnet.template;
local graphPanel = grafonnet.graphPanel;

local grafana = import 'grafana/grafana.libsonnet';

{
  _config+:: {
  },
  grafanaDashboards+:: {
    'proxmox-dashboard.json':
      local dataSourceTemplate = template.new(
        name='datasource',
        datasource='$datasource',
        query='InfluxDB',
        current='InfluxDB',
        refresh=2,
        includeAll=false,
        sort=1
      );

      dashboard.new('Proxmox')
      .addRow(
        row.new()
        .addPanel(
          graphPanel.new('My Panel', span=6, datasource='$datasource')
        )
      ) + {
        templating+: {
          list+: [dataSourceTemplate],
        },
      },
  },
}
