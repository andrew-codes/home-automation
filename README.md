# Home Automation

This mono-repo consists of all the applications and services used in the automation of my home. Some highlights and features of this repo include:

- most services run in a local K8s cluster (Proxmox LXC container), with a few running directly in Proxmox as LXC containers
- the provisioning and deployment of all services is fully automated via the command-line; including any dependent services
- select services from the k8s cluster are exposed and accessed from the Internet via a secure Cloudflare tunnel; DNS automatically configured
- services' configuration and secrets are managed by a 1Password vault
- centralized logging, metrics, and monitoring

## App/Services Overview

| Name            | Provisioned on | Description                                                                                                          |
| :-------------- | :------------- | :------------------------------------------------------------------------------------------------------------------- |
| pihole1         | Proxmox        | Local DNS server, network-wide ad blocker.                                                                           |
| pihole2         | Proxmox        | Redundant local DNS server, network-wide ad blocker.                                                                 |
| docker-registry | Proxmox        | Local registry for images built by this repo.                                                                        |
| tailscale       | Proxmox        | Network-level VPN and exit-node.                                                                                     |
| k8s-main        | Proxmox        | Control plane node for local K8s cluster.                                                                            |
| secrets         | k8s            | OnePassword k8s and CLI integration; providing secrets and configuration to all services; at deployment and runtime. |
| nfs-provider    | k8s            | Automatically provision and create volumes on an NFS file share (hosted on a NAS).                                   |
| metrics         | k8s            | Time-series database (victoria-metrics) used for capturing metrics for Proxmox, k8s, logs, and IoT devices.          |
| grafana         | k8s            | Visualize and monitor Proxmox, k8s cluster and all application/service logs.                                         |
| mqtt            | k8s            | Message bus for IoT devices and other services.                                                                      |
| home-assistant  | k8s            | Singularly responsible entity for automation of home devices and services.                                           |
| zwavejs         | k8s            | Z-wave devices over MQTT.                                                                                            |
| ps5             | k8s            | Control PlayStation 4 and 5 devices over MQTT.                                                                       |
| wake-on-lan     | k8s            | Send wake-on-lan packets to wake devices via MQTT messages.                                                          |
| cloudflared     | k8s            | Expose k8s services over a secure Cloudflare tunnel, including HTTPS support.                                        |

## Documentation

> Updated documentation coming soon...
