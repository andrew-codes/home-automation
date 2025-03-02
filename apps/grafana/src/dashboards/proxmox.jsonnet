{
  "__inputs": [],
  "__elements": {},
  "__requires": [
    {
      "type": "grafana",
      "id": "grafana",
      "name": "Grafana",
      "version": "11.0.0"
    },
    {
      "type": "datasource",
      "id": "prometheus",
      "name": "Prometheus",
      "version": "1.0.0"
    },
    {
      "type": "panel",
      "id": "table",
      "name": "Table",
      "version": ""
    },
    {
      "type": "panel",
      "id": "timeseries",
      "name": "Time series",
      "version": ""
    }
  ],
  "annotations": {
    "list": [
      {
        "builtIn": 1,
        "datasource": {
          "type": "datasource",
          "uid": "grafana"
        },
        "enable": true,
        "hide": true,
        "iconColor": "rgba(0, 211, 255, 1)",
        "name": "Annotations & Alerts",
        "target": {
          "limit": 100,
          "matchAny": false,
          "tags": [],
          "type": "dashboard"
        },
        "type": "dashboard"
      }
    ]
  },
  "editable": true,
  "fiscalYearStartMonth": 0,
  "graphTooltip": 0,
  "id": null,
  "links": [
    {
      "asDropdown": true,
      "icon": "external link",
      "includeVars": false,
      "keepTime": true,
      "tags": ["proxmox"],
      "targetBlank": true,
      "title": "Proxmox",
      "tooltip": "",
      "type": "dashboards",
      "url": ""
    }
  ],
  "liveNow": false,
  "panels": [
    {
      "datasource": "victoriametrics",
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "thresholds"
          },
          "custom": {
            "align": "auto",
            "cellOptions": {
              "type": "auto"
            },
            "filterable": true,
            "inspect": false
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              },
              {
                "color": "red",
                "value": 80
              }
            ]
          },
          "unit": "dtdhms"
        },
        "overrides": [
          {
            "matcher": {
              "id": "byName",
              "options": "CPU Usage"
            },
            "properties": [
              {
                "id": "unit",
                "value": "percentunit"
              },
              {
                "id": "custom.cellOptions",
                "value": {
                  "type": "color-background"
                }
              },
              {
                "id": "thresholds",
                "value": {
                  "mode": "absolute",
                  "steps": [
                    {
                      "color": "green",
                      "value": null
                    },
                    {
                      "color": "#EAB839",
                      "value": 0.7
                    },
                    {
                      "color": "red",
                      "value": 0.9
                    }
                  ]
                }
              }
            ]
          },
          {
            "matcher": {
              "id": "byName",
              "options": "memory usage"
            },
            "properties": [
              {
                "id": "custom.cellOptions",
                "value": {
                  "type": "color-background"
                }
              },
              {
                "id": "unit",
                "value": "percentunit"
              },
              {
                "id": "thresholds",
                "value": {
                  "mode": "absolute",
                  "steps": [
                    {
                      "color": "green",
                      "value": null
                    },
                    {
                      "color": "#EAB839",
                      "value": 0.8
                    },
                    {
                      "color": "red",
                      "value": 0.9
                    }
                  ]
                }
              }
            ]
          },
          {
            "matcher": {
              "id": "byName",
              "options": "memory"
            },
            "properties": [
              {
                "id": "unit",
                "value": "bytes"
              }
            ]
          },
          {
            "matcher": {
              "id": "byName",
              "options": "CPUs"
            },
            "properties": [
              {
                "id": "unit",
                "value": "none"
              }
            ]
          }
        ]
      },
      "gridPos": {
        "h": 8,
        "w": 11,
        "x": 0,
        "y": 0
      },
      "id": 25,
      "options": {
        "cellHeight": "sm",
        "footer": {
          "countRows": false,
          "fields": "",
          "reducer": ["sum"],
          "show": false
        },
        "frameIndex": 0,
        "showHeader": true
      },
      "pluginVersion": "11.0.0",
      "targets": [
        {
          "datasource": "victoriametrics",
          "editorMode": "code",
          "exemplar": false,
          "expr": "system_uptime{object=~\"nodes\",host=~\"$node\"}",
          "format": "table",
          "instant": true,
          "interval": "",
          "legendFormat": "{{host}}",
          "range": false,
          "refId": "A"
        },
        {
          "datasource": "victoriametrics",
          "editorMode": "code",
          "exemplar": false,
          "expr": "cpustat_cpu{object=\"nodes\",host=~\"$node\"}",
          "format": "table",
          "hide": false,
          "instant": true,
          "legendFormat": "__auto",
          "range": false,
          "refId": "B"
        },
        {
          "datasource": "victoriametrics",
          "editorMode": "code",
          "exemplar": false,
          "expr": "memory_memused{object=\"nodes\",host=~\"$node\"} / memory_memtotal{object=\"nodes\",host=~\"$node\"}",
          "format": "table",
          "hide": false,
          "instant": true,
          "legendFormat": "__auto",
          "range": false,
          "refId": "C"
        },
        {
          "datasource": "victoriametrics",
          "editorMode": "code",
          "exemplar": false,
          "expr": "memory_memtotal{object=\"nodes\",host=~\"$node\"}",
          "format": "table",
          "hide": false,
          "instant": true,
          "legendFormat": "__auto",
          "range": false,
          "refId": "D"
        },
        {
          "datasource": "victoriametrics",
          "editorMode": "code",
          "exemplar": false,
          "expr": "cpustat_cpus{object=\"nodes\",host=~\"$node\"}",
          "format": "table",
          "hide": false,
          "instant": true,
          "legendFormat": "__auto",
          "range": false,
          "refId": "E"
        }
      ],
      "title": "Uptime",
      "transformations": [
        {
          "id": "joinByField",
          "options": {
            "byField": "host",
            "mode": "outer"
          }
        },
        {
          "id": "organize",
          "options": {
            "excludeByName": {
              "Time 1": true,
              "Time 2": true,
              "Time 3": true,
              "Time 4": true,
              "Time 5": true,
              "__name__ 1": true,
              "__name__ 2": true,
              "__name__ 3": true,
              "__name__ 4": true,
              "object 1": true,
              "object 2": true,
              "object 3": true,
              "object 4": true,
              "object 5": true
            },
            "includeByName": {},
            "indexByName": {
              "Time 1": 7,
              "Time 2": 9,
              "Time 3": 12,
              "Time 4": 14,
              "Time 5": 17,
              "Value #A": 1,
              "Value #B": 5,
              "Value #C": 3,
              "Value #D": 2,
              "Value #E": 4,
              "__name__ 1": 6,
              "__name__ 2": 10,
              "__name__ 3": 15,
              "__name__ 4": 18,
              "host": 0,
              "object 1": 8,
              "object 2": 11,
              "object 3": 13,
              "object 4": 16,
              "object 5": 19
            },
            "renameByName": {
              "Field": "Node",
              "Last *": "Uptime",
              "Value #A": "uptime",
              "Value #B": "CPU Usage",
              "Value #C": "memory usage",
              "Value #D": "memory",
              "Value #E": "CPUs",
              "__name__ 1": ""
            }
          }
        }
      ],
      "type": "table"
    },
    {
      "datasource": "victoriametrics",
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "thresholds"
          },
          "custom": {
            "align": "auto",
            "cellOptions": {
              "type": "auto"
            },
            "filterable": true,
            "inspect": false
          },
          "mappings": [],
          "min": 100,
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              },
              {
                "color": "#EAB839",
                "value": 70
              },
              {
                "color": "red",
                "value": 80
              }
            ]
          },
          "unit": "bytes"
        },
        "overrides": [
          {
            "matcher": {
              "id": "byName",
              "options": "Percent Used"
            },
            "properties": [
              {
                "id": "custom.cellOptions",
                "value": {
                  "type": "color-background"
                }
              },
              {
                "id": "unit",
                "value": "percentunit"
              },
              {
                "id": "thresholds",
                "value": {
                  "mode": "absolute",
                  "steps": [
                    {
                      "color": "green",
                      "value": null
                    },
                    {
                      "color": "#EAB839",
                      "value": 0.7
                    },
                    {
                      "color": "red",
                      "value": 0.8
                    }
                  ]
                }
              }
            ]
          }
        ]
      },
      "gridPos": {
        "h": 8,
        "w": 13,
        "x": 11,
        "y": 0
      },
      "id": 11,
      "options": {
        "cellHeight": "sm",
        "footer": {
          "countRows": false,
          "fields": "",
          "reducer": ["sum"],
          "show": false
        },
        "frameIndex": 0,
        "showHeader": true,
        "sortBy": [
          {
            "desc": true,
            "displayName": "type"
          }
        ]
      },
      "pluginVersion": "11.0.0",
      "targets": [
        {
          "datasource": "victoriametrics",
          "editorMode": "code",
          "exemplar": false,
          "expr": "system_used{object=\"storages\",nodename=~\"$node\"} ",
          "format": "table",
          "instant": true,
          "interval": "",
          "intervalFactor": 1,
          "legendFormat": "",
          "refId": "A"
        },
        {
          "datasource": "victoriametrics",
          "editorMode": "code",
          "exemplar": false,
          "expr": "system_total{object=\"storages\",nodename=~\"$node\"}",
          "format": "table",
          "hide": false,
          "instant": true,
          "interval": "",
          "intervalFactor": 1,
          "legendFormat": "",
          "refId": "B"
        },
        {
          "datasource": "victoriametrics",
          "editorMode": "code",
          "exemplar": false,
          "expr": "system_used{object=\"storages\",nodename=~\"$node\"} / system_total{object=\"storages\",nodename=~\"$node\"}",
          "format": "table",
          "hide": false,
          "instant": true,
          "legendFormat": "__auto",
          "range": false,
          "refId": "C"
        },
        {
          "datasource": "victoriametrics",
          "editorMode": "code",
          "exemplar": false,
          "expr": "system_total{object=\"storages\",nodename=~\"$node\"} - system_used{object=\"storages\",nodename=~\"$node\"}",
          "format": "table",
          "hide": false,
          "instant": true,
          "legendFormat": "__auto",
          "range": false,
          "refId": "D"
        }
      ],
      "title": "Node Storage",
      "transformations": [
        {
          "id": "seriesToColumns",
          "options": {
            "byField": "host"
          }
        },
        {
          "id": "organize",
          "options": {
            "excludeByName": {
              "Time 1": true,
              "Time 2": true,
              "Time 3": true,
              "Time 4": true,
              "__name__": true,
              "__name__ 1": true,
              "__name__ 2": true,
              "nodename 1": true,
              "nodename 2": true,
              "nodename 3": true,
              "nodename 4": true,
              "object 1": true,
              "object 2": true,
              "object 3": true,
              "object 4": true,
              "type 2": true,
              "type 3": true,
              "type 4": true
            },
            "includeByName": {},
            "indexByName": {
              "Time 1": 6,
              "Time 2": 9,
              "Time 3": 15,
              "Time 4": 19,
              "Value #A": 2,
              "Value #B": 4,
              "Value #C": 5,
              "Value #D": 3,
              "__name__ 1": 13,
              "__name__ 2": 14,
              "host": 0,
              "nodename 1": 7,
              "nodename 2": 10,
              "nodename 3": 16,
              "nodename 4": 20,
              "object 1": 8,
              "object 2": 11,
              "object 3": 17,
              "object 4": 21,
              "type 1": 1,
              "type 2": 12,
              "type 3": 18,
              "type 4": 22
            },
            "renameByName": {
              "Percent": "",
              "Time 1": "",
              "Value #A": "Used",
              "Value #B": "Total",
              "Value #C": "Percent Used",
              "Value #D": "Available",
              "host": "Storage",
              "type 1": "Type"
            }
          }
        }
      ],
      "type": "table"
    },
    {
      "datasource": "victoriametrics",
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "thresholds"
          },
          "custom": {
            "align": "auto",
            "cellOptions": {
              "type": "auto"
            },
            "filterable": true,
            "inspect": false
          },
          "mappings": [
            {
              "options": {
                "qemu": {
                  "index": 0,
                  "text": "vm"
                }
              },
              "type": "value"
            }
          ],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              },
              {
                "color": "red",
                "value": 80
              }
            ]
          }
        },
        "overrides": [
          {
            "matcher": {
              "id": "byName",
              "options": "CPU Percent"
            },
            "properties": [
              {
                "id": "custom.cellOptions",
                "value": {
                  "type": "color-background"
                }
              },
              {
                "id": "unit",
                "value": "percentunit"
              },
              {
                "id": "thresholds",
                "value": {
                  "mode": "absolute",
                  "steps": [
                    {
                      "color": "green",
                      "value": null
                    },
                    {
                      "color": "#EAB839",
                      "value": 0.7
                    },
                    {
                      "color": "red",
                      "value": 0.9
                    }
                  ]
                }
              }
            ]
          },
          {
            "matcher": {
              "id": "byName",
              "options": "Mem Used Percent"
            },
            "properties": [
              {
                "id": "custom.cellOptions",
                "value": {
                  "type": "color-background"
                }
              },
              {
                "id": "unit",
                "value": "percentunit"
              },
              {
                "id": "thresholds",
                "value": {
                  "mode": "absolute",
                  "steps": [
                    {
                      "color": "green",
                      "value": null
                    },
                    {
                      "color": "#EAB839",
                      "value": 0.7
                    },
                    {
                      "color": "red",
                      "value": 0.9
                    }
                  ]
                }
              }
            ]
          },
          {
            "matcher": {
              "id": "byName",
              "options": "Disk Used"
            },
            "properties": [
              {
                "id": "unit",
                "value": "bytes"
              }
            ]
          },
          {
            "matcher": {
              "id": "byName",
              "options": "Memory"
            },
            "properties": [
              {
                "id": "unit",
                "value": "bytes"
              }
            ]
          },
          {
            "matcher": {
              "id": "byName",
              "options": "Mem Used"
            },
            "properties": [
              {
                "id": "unit",
                "value": "bytes"
              }
            ]
          }
        ]
      },
      "gridPos": {
        "h": 13,
        "w": 24,
        "x": 0,
        "y": 8
      },
      "id": 16,
      "options": {
        "cellHeight": "sm",
        "footer": {
          "countRows": false,
          "fields": "",
          "reducer": ["sum"],
          "show": false
        },
        "frameIndex": 2,
        "showHeader": true,
        "sortBy": [
          {
            "desc": true,
            "displayName": "Mem Used Percent"
          }
        ]
      },
      "pluginVersion": "11.0.0",
      "targets": [
        {
          "datasource": "victoriametrics",
          "editorMode": "code",
          "exemplar": true,
          "expr": "system_disk{object=~\"qemu|lxc\",nodename=~\"$node.*\"}",
          "format": "table",
          "instant": true,
          "interval": "",
          "intervalFactor": 1,
          "legendFormat": "",
          "refId": "A"
        },
        {
          "datasource": "victoriametrics",
          "editorMode": "code",
          "exemplar": true,
          "expr": "system_maxmem{object=~\"lxc|qemu\",nodename=~\"$node.*\"}",
          "format": "table",
          "hide": false,
          "instant": true,
          "interval": "",
          "legendFormat": "",
          "refId": "B"
        },
        {
          "datasource": "victoriametrics",
          "editorMode": "code",
          "exemplar": true,
          "expr": "system_cpus{nodename=~\"$node.*\"}",
          "format": "table",
          "hide": false,
          "instant": true,
          "interval": "",
          "legendFormat": "",
          "refId": "C"
        },
        {
          "datasource": "victoriametrics",
          "editorMode": "code",
          "exemplar": true,
          "expr": "system_mem{object=~\"lxc|qemu\",nodename=~\"$node.*\"}",
          "format": "table",
          "hide": false,
          "instant": true,
          "interval": "",
          "legendFormat": "",
          "refId": "D"
        },
        {
          "datasource": "victoriametrics",
          "editorMode": "code",
          "exemplar": true,
          "expr": "system_cpu{nodename=~\"$node.*\",object=~\"lxc|qemu\"}",
          "format": "table",
          "hide": false,
          "instant": true,
          "interval": "",
          "legendFormat": "",
          "refId": "E"
        },
        {
          "datasource": "victoriametrics",
          "editorMode": "code",
          "exemplar": false,
          "expr": "system_mem{object=~\"lxc|qemu\",nodename=~\"$node.*\"} / system_maxmem{object=~\"lxc|qemu\",nodename=~\"$node.*\"}",
          "format": "table",
          "hide": false,
          "instant": true,
          "legendFormat": "__auto",
          "range": false,
          "refId": "F"
        }
      ],
      "title": "Guest Resources",
      "transformations": [
        {
          "id": "seriesToColumns",
          "options": {
            "byField": "vmid"
          }
        },
        {
          "id": "organize",
          "options": {
            "excludeByName": {
              "Time 1": true,
              "Time 2": true,
              "Time 3": true,
              "Time 4": true,
              "Time 5": true,
              "Time 6": true,
              "__name__": true,
              "__name__ 1": true,
              "__name__ 2": true,
              "__name__ 3": true,
              "__name__ 4": true,
              "__name__ 5": true,
              "host 2": true,
              "host 3": true,
              "host 4": true,
              "host 5": true,
              "host 6": true,
              "nodename 1": true,
              "nodename 2": true,
              "nodename 3": true,
              "nodename 4": true,
              "nodename 5": true,
              "nodename 6": true,
              "object 1": false,
              "object 2": true,
              "object 3": true,
              "object 4": true,
              "object 5": true,
              "object 6": true
            },
            "includeByName": {},
            "indexByName": {
              "Time 1": 9,
              "Time 2": 11,
              "Time 3": 15,
              "Time 4": 19,
              "Time 5": 23,
              "Time 6": 32,
              "Value #A": 7,
              "Value #B": 6,
              "Value #C": 4,
              "Value #D": 5,
              "Value #E": 3,
              "Value #F": 8,
              "__name__ 1": 27,
              "__name__ 2": 28,
              "__name__ 3": 29,
              "__name__ 4": 30,
              "__name__ 5": 31,
              "host 1": 0,
              "host 2": 12,
              "host 3": 16,
              "host 4": 20,
              "host 5": 24,
              "host 6": 33,
              "nodename 1": 10,
              "nodename 2": 13,
              "nodename 3": 17,
              "nodename 4": 21,
              "nodename 5": 25,
              "nodename 6": 34,
              "object 1": 1,
              "object 2": 14,
              "object 3": 18,
              "object 4": 22,
              "object 5": 26,
              "object 6": 35,
              "vmid": 2
            },
            "renameByName": {
              "Value #A": "Disk Used",
              "Value #B": "Memory",
              "Value #C": "CPU",
              "Value #D": "Mem Used",
              "Value #E": "CPU Percent",
              "Value #F": "Mem Used Percent",
              "host 1": "Guest",
              "object 1": "Type"
            }
          }
        }
      ],
      "type": "table"
    },
    {
      "datasource": "victoriametrics",
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 0,
            "gradientMode": "none",
            "hideFrom": {
              "legend": false,
              "tooltip": false,
              "viz": false
            },
            "insertNulls": false,
            "lineInterpolation": "linear",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "auto",
            "spanNulls": false,
            "stacking": {
              "group": "A",
              "mode": "none"
            },
            "thresholdsStyle": {
              "mode": "off"
            }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              },
              {
                "color": "red",
                "value": 80
              }
            ]
          },
          "unit": "binBps"
        },
        "overrides": []
      },
      "gridPos": {
        "h": 9,
        "w": 7,
        "x": 0,
        "y": 21
      },
      "id": 18,
      "options": {
        "legend": {
          "calcs": ["max", "mean", "sum"],
          "displayMode": "table",
          "placement": "right",
          "showLegend": true,
          "sortBy": "Mean",
          "sortDesc": true
        },
        "tooltip": {
          "maxHeight": 600,
          "mode": "multi",
          "sort": "desc"
        }
      },
      "targets": [
        {
          "datasource": "victoriametrics",
          "editorMode": "code",
          "exemplar": true,
          "expr": "irate(system_netin{object=~\"lxc|qemu\",nodename=~\"$node\",host=~\"$guest\"})",
          "interval": "",
          "legendFormat": "{{host}}_in",
          "range": true,
          "refId": "A"
        },
        {
          "datasource": "victoriametrics",
          "editorMode": "code",
          "exemplar": true,
          "expr": "irate(system_netout{object=~\"lxc|qemu\",nodename=~\"$node\",host=~\"$guest\"})",
          "hide": false,
          "interval": "",
          "legendFormat": "{{host}}_out",
          "range": true,
          "refId": "B"
        }
      ],
      "title": "Guest network Traffic",
      "type": "timeseries"
    },
    {
      "datasource": "victoriametrics",
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 0,
            "gradientMode": "none",
            "hideFrom": {
              "legend": false,
              "tooltip": false,
              "viz": false
            },
            "insertNulls": false,
            "lineInterpolation": "linear",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "auto",
            "spanNulls": false,
            "stacking": {
              "group": "A",
              "mode": "none"
            },
            "thresholdsStyle": {
              "mode": "off"
            }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              },
              {
                "color": "red",
                "value": 80
              }
            ]
          }
        },
        "overrides": []
      },
      "gridPos": {
        "h": 9,
        "w": 8,
        "x": 7,
        "y": 21
      },
      "id": 22,
      "options": {
        "legend": {
          "calcs": ["min", "max", "mean"],
          "displayMode": "table",
          "placement": "right",
          "showLegend": true,
          "sortBy": "Max",
          "sortDesc": true
        },
        "tooltip": {
          "maxHeight": 600,
          "mode": "multi",
          "sort": "desc"
        }
      },
      "targets": [
        {
          "datasource": "victoriametrics",
          "editorMode": "code",
          "exemplar": true,
          "expr": "cpustat_wait{host=~\"$node\"}",
          "interval": "",
          "legendFormat": "{{host}}",
          "range": true,
          "refId": "A"
        }
      ],
      "title": "iowait",
      "type": "timeseries"
    },
    {
      "datasource": "victoriametrics",
      "fieldConfig": {
        "defaults": {
          "color": {
            "mode": "palette-classic"
          },
          "custom": {
            "axisBorderShow": false,
            "axisCenteredZero": false,
            "axisColorMode": "text",
            "axisLabel": "",
            "axisPlacement": "auto",
            "barAlignment": 0,
            "drawStyle": "line",
            "fillOpacity": 0,
            "gradientMode": "none",
            "hideFrom": {
              "legend": false,
              "tooltip": false,
              "viz": false
            },
            "insertNulls": false,
            "lineInterpolation": "linear",
            "lineWidth": 1,
            "pointSize": 5,
            "scaleDistribution": {
              "type": "linear"
            },
            "showPoints": "auto",
            "spanNulls": false,
            "stacking": {
              "group": "A",
              "mode": "none"
            },
            "thresholdsStyle": {
              "mode": "off"
            }
          },
          "mappings": [],
          "thresholds": {
            "mode": "absolute",
            "steps": [
              {
                "color": "green",
                "value": null
              },
              {
                "color": "red",
                "value": 80
              }
            ]
          },
          "unit": "binBps"
        },
        "overrides": []
      },
      "gridPos": {
        "h": 9,
        "w": 9,
        "x": 15,
        "y": 21
      },
      "id": 20,
      "options": {
        "legend": {
          "calcs": ["max", "mean", "sum"],
          "displayMode": "table",
          "placement": "right",
          "showLegend": true,
          "sortBy": "Total",
          "sortDesc": true
        },
        "tooltip": {
          "maxHeight": 600,
          "mode": "multi",
          "sort": "desc"
        }
      },
      "targets": [
        {
          "datasource": "victoriametrics",
          "editorMode": "code",
          "exemplar": true,
          "expr": "irate(system_diskread{nodename=~\"$node\",host=~\"$guest\"})",
          "interval": "",
          "legendFormat": "{{host}}",
          "range": true,
          "refId": "A"
        },
        {
          "datasource": "victoriametrics",
          "editorMode": "code",
          "exemplar": true,
          "expr": "irate(system_diskwrite{nodename=~\"$node\",host=~\"$guest\"})",
          "hide": false,
          "interval": "",
          "legendFormat": "{{host}}",
          "range": true,
          "refId": "B"
        }
      ],
      "title": "Guest Diskio",
      "type": "timeseries"
    }
  ],
  "refresh": "",
  "schemaVersion": 39,
  "tags": ["proxmox"],
  "templating": {
    "list": [
      {
        "current": {},
        "datasource": "victoriametrics",
        "definition": "label_values(cpustat_idle{object=\"nodes\"},host)",
        "hide": 0,
        "includeAll": true,
        "multi": true,
        "name": "node",
        "options": [],
        "query": {
          "query": "label_values(cpustat_idle{object=\"nodes\"},host)",
          "refId": "StandardVariableQuery"
        },
        "refresh": 1,
        "regex": "",
        "skipUrlSync": false,
        "sort": 0,
        "type": "query"
      },
      {
        "current": {},
        "datasource": "victoriametrics",
        "definition": "label_values(system_cpu{object=~\"lxc|qemu\", nodename=~\"$node\"},host)",
        "hide": 0,
        "includeAll": true,
        "multi": true,
        "name": "guest",
        "options": [],
        "query": {
          "qryType": 1,
          "query": "label_values(system_cpu{object=~\"lxc|qemu\", nodename=~\"$node\"},host)",
          "refId": "PrometheusVariableQueryEditor-VariableQuery"
        },
        "refresh": 1,
        "regex": "",
        "skipUrlSync": false,
        "sort": 0,
        "type": "query"
      }
    ]
  },
  "time": {
    "from": "now-24h",
    "to": "now"
  },
  "timeRangeUpdatedDuringEditOrView": false,
  "timepicker": {},
  "timezone": "",
  "title": "Proxmox metrics",
  "uid": "CcDBg5Knk",
  "version": 12,
  "weekStart": "",
  "gnetId": 16060
}
