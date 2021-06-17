# Metrics

Deploys [kube-prometheus](https://github.com/prometheus-operator/kube-prometheus) for monitoring cluster; including Prometheus, Grafana (with accompanying dashboards), and alert manager.

## Viewing Dashboards

Run `yarn dashboard --scope @ha/metrics` and navigate to one of three URLs:

- [http://localhost:9090](http://localhost:9090) for Prometheus
- [http://localhost:3000](http://localhost:3000) for Grafana; username:password is admin:admin (will prompt you to change your password)
- [http://localhost:9093](http://localhost:9093) for alert manager
