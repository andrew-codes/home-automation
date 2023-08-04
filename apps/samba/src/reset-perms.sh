#!/usr/bin/env bash

event="$1"
directory="$2"
file="$3"

# run some command based on an event
case "$event" in
a) echo "event $event for $file in $directory" && chmod 0777 "$directory/$file" ;;
esac
