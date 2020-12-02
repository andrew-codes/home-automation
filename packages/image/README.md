# Overview

CLI to automate burning ISO installation images to USB drives.

# Usage

> All usage scenarios require a USB drive to be available.

## Imaging the USB

1. The `yarn burn-image`
   - path to the USB drive
   - path to the ISO image

> All usage scenarios require root access (in order to burn drive).

```shell
# x86 CPUs
sudo burn-image /dev/disk2 ~/Downloads/ubuntu-20.04.1-live-server-amd64.iso
```

# Running Tests

`yarn test`
