#!/bin/sh

source "${BASH_SOURCE%/*}/read-secret.sh" || exit
echo "Enter machine password:"
read_secret -r password
sudo -S node $(yarn bin burn-image) $@ <<<$password
