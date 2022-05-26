#!/usr/bin/env bash

ARGS_STRING=""

for line in $(env | grep DEPLOY_); do
    ARGS_STRING="$ARGS_STRING --ext-str '$(echo -n $line | tr '\n' ' ')'"
done

COMMAND="jsonnet -J vendor $(echo -n "$ARGS_STRING" | tr '\n' ' ')"
bash -c "$COMMAND $1 > $2"
