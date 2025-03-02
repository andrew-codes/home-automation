{
  vmselect: {
    podAnnotations: {
      "prometheus.io/scrape": "true",
      "prometheus.io/port": "8481",
    },
  },
  vminsert: {
    podAnnotations: {
      "prometheus.io/scrape": "true",
      "prometheus.io/port": "8480",
    },
  },
  vmstorage: {
    replicaCount: 1,
    retentionPeriod: 12,
    persistentVolume: {
      name: "victoria-metrics-pv",
      enabled: true,
      storageClassName: "nfs",
      size: "200Gi",
      mountPath: "/vmstorage-data",
    },
    podAnnotations: {
      "prometheus.io/scrape": "true",
      "prometheus.io/port": "8482",
    },
  },
}
