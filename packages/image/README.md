# Overview

A CLI utility to create installation media which will install Ubuntu Server and necessary software for the Kubernetes cluster.

# Usage

> All usage scenarios require a USB drive to be available.

## Imaging the USB

1. The `image-node` variant CLI commands all require the same 3 arguments;
   - path to the USB drive
   - path to the Ubuntu ISO image

> All usage scenarios require root access (in order to burn drive).

```shell
# x86 CPUs
sudo image-node-amd64 /dev/disk2 ~/Downloads/ubuntu-20.04.1-live-server-amd64.iso
```

# Running Tests

Via CLI: `yarn test`
