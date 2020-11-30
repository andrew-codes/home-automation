# Overview

A CLI utility to create installation media which will install Ubuntu Server and necessary software for the Kubernetes cluster.

# Usage

> All usage scenarios require a USB drive to be available.

## Creating Master Node Installation Media

1. The `image-master-node` CLI command requires 2 arguments;
    * The hostname of the machine in which  the media will be installed onto
    * The path to the USB drive.
1. Example: `image-master-node master-node /dev/disk2`