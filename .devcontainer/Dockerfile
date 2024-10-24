FROM mcr.microsoft.com/devcontainers/base:bookworm
USER root
ENV OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES

RUN apt update -y --fix-missing

RUN apt-get install -y \
    apt-transport-https

RUN apt-get install -y \
    build-essential \
    ca-certificates \
    curl \
    dbus-user-session \
    dnsutils \
    etherwake \
    gettext \
    gettext-base \
    gnupg \
    gnupg2 \
    iptables \
    iputils-ping \
    libexpat1-dev \
    libssl3 \
    libssl-dev \
    locales \
    lxc \
    make \
    mosquitto-clients \
    nano \
    net-tools \
    snmp \
    software-properties-common \
    sshfs \
    sshpass \
    sudo \
    unzip \
    xsel \
    zlib1g-dev


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

RUN mkdir -p ~/.kube
COPY bash_profile_setup.sh /root/.bash_profile_setup.sh
RUN echo "source ~/.bash_profile_setup.sh" >>/root/.bashrc
RUN echo "source ~/.bash_profile_setup.sh" >>/root/.bash_profile
