#!/bin/sh

source secrets.sh
sudo -S node $(yarn bin burn-image) $@ <<<$DEV_MACHINE_PASSWORD
