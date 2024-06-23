FROM mcr.microsoft.com/devcontainers/base:ubuntu-22.04
ENV DEBIAN_FRONTEND=noninteractive
ENV OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES
USER root

RUN apt update -y

RUN apt-get install -y \
    apt-transport-https

RUN apt-get install -y \
    curl \
    gettext \
    gnupg \
    gnupg2 \
    gpg \
    libexpat1-dev \
    libssl-dev \
    make \
    software-properties-common \
    unzip

RUN mkdir -p /etc/apt/keyrings/

# Ansible
RUN echo "deb http://ppa.launchpad.net/ansible/ansible/ubuntu focal main"
RUN add-apt-repository -y --update ppa:ansible/ansible
RUN add-apt-repository -y --update ppa:deadsnakes/ppa

RUN apt update -y --fix-missing
RUN apt-get upgrade -y

RUN apt-get install -y \
    ansible \
    ansible-lint \
    bash \
    ca-certificates \
    dbus-user-session \
    dnsutils \
    etherwake \
    gettext-base \
    iptables \
    iputils-ping \
    libssl3 \
    locales \
    lxc \
    mosquitto-clients \
    nano \
    net-tools \
    python-apt-common \
    python3-apt \
    snmp \
    sshfs \
    sshpass \
    sudo \
    xsel

RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/library-scripts

# terraform
RUN CURRR_VER=$(curl -s https://checkpoint-api.hashicorp.com/v1/check/terraform | jq -r -M '.current_version') \
    curl -q "https://releases.hashicorp.com/terraform/${CURRR_VER#?}/terraform_${CURRR_VER#?}_linux_amd64.zip" -o /usr/local/bin/terraform
RUN chmod +x /usr/local/bin/terraform

# Telepresence
RUN curl -fL https://app.getambassador.io/download/tel2/linux/amd64/latest/telepresence -o /usr/local/bin/telepresence
RUN chmod a+x /usr/local/bin/telepresence

# Ansible
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen
RUN locale-gen
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

RUN rm -f ~/.ssh/environment

# rover
RUN curl -sSL https://rover.apollo.dev/nix/latest | sh
