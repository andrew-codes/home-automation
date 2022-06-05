#!/usr/bin/env bash

export APPROVE_INSTALL="y"
export APPROVE_IP="y"
export IPV6_SUPPORT="n"
export PORT_CHOICE="1"
export PROTOCOL_CHOICE="1"
export DNS="1"
export COMPRESSION_ENABLED="n"
export CUSTOMIZE_ENC="n"
export AUTO_INSTALL="y"
export ENDPOINT="vpn.smith-simms.family"

/openvpn-install.sh

touch /install.log
