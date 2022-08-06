#!/bin/bash

cat ~/.ssh/id_rsa | sed -E 's/\\n/\n/g' >~/.ssh/id_rsa
. entrypoint.sh
