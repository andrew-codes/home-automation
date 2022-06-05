#!/usr/bin/env bash

chown 100000:100000 /dev/net/tun
echo $(cat src/pve/ct.conf) >>/etc/pve/lxc/100.conf
