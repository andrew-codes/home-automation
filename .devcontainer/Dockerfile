FROM ubuntu:20.04
ENV DEBIAN_FRONTEND=noninteractive
ENV OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES
USER root

RUN apt-get install -y \
    apt-transport-https

RUN apt update -y

RUN apt-get install -y \
    curl \
    gettext \
    gnupg2 \
    gpg \
    libcurl4-gnutls-dev \
    libexpat1-dev \
    libghc-zlib-dev \
    libssl-dev \
    make \
    software-properties-common \
    unzip

RUN mkdir -p /etc/apt/keyrings/

# terraform
RUN curl -s https://apt.releases.hashicorp.com/gpg | apt-key add -
RUN echo "deb [arch=$(dpkg --print-architecture)] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | tee -a /etc/apt/sources.list.d/hashicorp.list

# kubectl
RUN curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.29/deb/Release.key | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
RUN echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.29/deb/ /" | tee -a /etc/apt/sources.list.d/kubernetes.list

# Ansible
RUN echo "deb http://ppa.launchpad.net/ansible/ansible/ubuntu focal main"
RUN add-apt-repository -y --update ppa:ansible/ansible
RUN add-apt-repository -y --update ppa:deadsnakes/ppa

# 1Password
RUN echo "deb http://security.ubuntu.com/ubuntu xenial-security main" >>/etc/apt/sources.list
RUN curl -sS https://downloads.1password.com/linux/keys/1password.asc | gpg --dearmor --output /usr/share/keyrings/1password-archive-keyring.gpg
RUN echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/1password-archive-keyring.gpg] https://downloads.1password.com/linux/debian/amd64 stable main' | tee /etc/apt/sources.list.d/1password.list
RUN mkdir -p /etc/debsig/policies/AC2D62742012EA22/
RUN curl -sS https://downloads.1password.com/linux/debian/debsig/1password.pol | tee /etc/debsig/policies/AC2D62742012EA22/1password.pol
RUN mkdir -p /usr/share/debsig/keyrings/AC2D62742012EA22
RUN curl -sS https://downloads.1password.com/linux/keys/1password.asc | gpg --dearmor --output /usr/share/debsig/keyrings/AC2D62742012EA22/debsig.gpg

RUN apt update -y --fix-missing
RUN apt-get upgrade -y

RUN apt-get install -y \
    1password \
    1password-cli \
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
    jq \
    kubectl \
    libssl1.0.0 \
    locales \
    lxc \
    mosquitto-clients \
    nano \
    net-tools \
    python-apt-common \
    python3-apt \
    python3-pip \
    python3.11 \
    snmp \
    sshfs \
    sshpass \
    sudo \
    terraform \
    xsel

RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/library-scripts

# Telepresence
RUN sudo curl -fL https://app.getambassador.io/download/tel2/linux/amd64/latest/telepresence -o /usr/local/bin/telepresence
RUN sudo chmod a+x /usr/local/bin/telepresence

# Ansible
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen
RUN locale-gen
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
RUN pip3 install "pywinrm>=0.3.0"
RUN pip3 install "PyYAML"
RUN ansible-galaxy collection install ansible.windows
RUN ansible-galaxy collection install community.windows
RUN ansible-galaxy collection install kubernetes.core

# yq
RUN curl https://github.com/mikefarah/yq/releases/download/v4.6.3/yq_linux_amd64 -O /usr/bin/yq
RUN chmod +x /usr/bin/yq
RUN mkdir -p /usr/local/bin

# helm
RUN ln -s /usr/bin/gpg /usr/local/bin/gpg
RUN curl -fsSL -o helm.tar.gz https://get.helm.sh/helm-v3.6.1-linux-amd64.tar.gz
RUN tar -zxvf helm.tar.gz
RUN mv linux-amd64/helm /usr/local/bin/helm

RUN rm -f ~/.ssh/environment

# go, jsonnet
RUN curl https://dl.google.com/go/go1.18.1.linux-amd64.tar.gz -O - | sudo tar -xz -C /usr/local
RUN ln -s /usr/local/go/bin/go /usr/local/bin
RUN go install github.com/google/go-jsonnet/cmd/jsonnet@latest
RUN go install -a github.com/jsonnet-bundler/jsonnet-bundler/cmd/jb@latest
RUN ln -s $(go env GOPATH)/bin/jsonnet /usr/local/bin
RUN ln -s $(go env GOPATH)/bin/jb /usr/local/bin

# git
RUN git clone https://github.com/git/git.git
RUN cd git && git checkout v2.38.1 && sudo make prefix=/usr/local all && sudo make prefix=/usr/local install

# rover
RUN curl -sSL https://rover.apollo.dev/nix/latest | sh

# d2
RUN curl -fsSL https://d2lang.com/install.sh | sh -s --
