FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive
ENV OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES
USER root

RUN apt-get install -y \
    apt-transport-https

RUN apt update -y

RUN apt-get install -y \
    curl \
    gpg \
    gnupg2 \
    wget \
    make libssl-dev libghc-zlib-dev libcurl4-gnutls-dev libexpat1-dev gettext unzip \
    software-properties-common

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -

RUN curl -s https://apt.releases.hashicorp.com/gpg | apt-key add -
RUN echo "deb [arch=$(dpkg --print-architecture)] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | tee -a /etc/apt/sources.list.d/hashicorp.list

RUN curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
RUN echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | tee -a /etc/apt/sources.list.d/kubernetes.list

RUN curl -sS https://download.docker.com/linux/ubuntu/gpg | apt-key add -
RUN echo "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable" | tee -a /etc/apt/sources.list.d/docker.list

RUN echo "deb http://ppa.launchpad.net/ansible/ansible/ubuntu focal main"
RUN add-apt-repository -y --update ppa:ansible/ansible
RUN add-apt-repository -y --update ppa:deadsnakes/ppa

RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys DA418C88A3219F7B
RUN curl -sS https://packages.microsoft.com/keys/microsoft.asc | (OUT=$(apt-key add - 2>&1) || echo $OUT)
RUN curl https://packages.microsoft.com/config/ubuntu/22.04/prod.list | tee /etc/apt/sources.list.d/msprod.list
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 40976EAF437D05B5 3B4FE6ACC0B21F32

RUN echo "deb http://security.ubuntu.com/ubuntu xenial-security main" >>/etc/apt/sources.list
RUN curl -sS https://downloads.1password.com/linux/keys/1password.asc | gpg --dearmor --output /usr/share/keyrings/1password-archive-keyring.gpg
RUN echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/1password-archive-keyring.gpg] https://downloads.1password.com/linux/debian/amd64 stable main' | tee /etc/apt/sources.list.d/1password.list
RUN mkdir -p /etc/debsig/policies/AC2D62742012EA22/
RUN curl -sS https://downloads.1password.com/linux/debian/debsig/1password.pol | tee /etc/debsig/policies/AC2D62742012EA22/1password.pol
RUN mkdir -p /usr/share/debsig/keyrings/AC2D62742012EA22
RUN curl -sS https://downloads.1password.com/linux/keys/1password.asc | gpg --dearmor --output /usr/share/debsig/keyrings/AC2D62742012EA22/debsig.gpg

RUN apt update -y --fix-missing
RUN apt-get upgrade -y

RUN apt-get remove docker docker-engine docker.io containerd

RUN apt-get install -y \
    1password \
    1password-cli \
    ansible \
    ansible-lint \
    bash \
    ca-certificates \
    dbus-user-session \
    dnsutils \
    docker-ce \ 
dotnet-runtime-7.0 \
    dotnet-sdk-7.0 \
    etherwake \
    gettext-base \
    iptables \
    iputils-ping \
    jq \
    jq \
    kubectl \
    kubectl \
    libssl1.0.0 libssl-dev \
    locales \
    lxc \
    lxc ca-certificates iptables \
    mosquitto-clients \
    nano \
    net-tools \
    nodejs \
    python-apt-common \
    python3-apt \
    python3-pip \
    python3.11 \
    snmp \
    sshfs \
    sshpass \
    sudo \
    terraform \
    unzip \
    xsel

RUN apt-get -y install --no-install-recommends openvpn
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/library-scripts
RUN echo 'OPENVPN_CONFIG=""' >>/etc/environment
RUN echo "unset OPENVPN_CONFIG" | tee -a /etc/bash.bashrc >/etc/profile.d/999-unset-openvpn-config.sh

RUN sudo curl -fL https://app.getambassador.io/download/tel2/linux/amd64/latest/telepresence -o /usr/local/bin/telepresence
RUN sudo chmod a+x /usr/local/bin/telepresence
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen
RUN locale-gen
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
RUN mkdir -p /etc/docker
RUN echo '{ "features": { "buildkit": true }, "exec-opts": [], "storage-driver": "overlay2", "log-driver": "json-file", "log-opts": {"max-size": "10m", "max-file": "3"} }' | tee /etc/docker/daemon.json
RUN pip3 install "pywinrm>=0.3.0"
RUN pip3 install "PyYAML"
RUN ansible-galaxy collection install ansible.windows
RUN ansible-galaxy collection install community.windows
RUN ansible-galaxy collection install kubernetes.core
RUN wget https://github.com/containerd/containerd/releases/download/v1.4.3/containerd-1.4.3-linux-amd64.tar.gz
RUN mkdir -p containerd
RUN tar -xvf containerd-1.4.3-linux-amd64.tar.gz --directory containerd
RUN mv containerd/bin/* /usr/bin
RUN wget https://github.com/mikefarah/yq/releases/download/v4.6.3/yq_linux_amd64 -O /usr/bin/yq
RUN chmod +x /usr/bin/yq
RUN mkdir -p /usr/local/bin
RUN ln -s /usr/bin/gpg /usr/local/bin/gpg
VOLUME /var/lib/docker
RUN curl -fsSL -o helm.tar.gz https://get.helm.sh/helm-v3.6.1-linux-amd64.tar.gz
RUN tar -zxvf helm.tar.gz
RUN mv linux-amd64/helm /usr/local/bin/helm
RUN rm -f ~/.ssh/environment
RUN wget -c https://dl.google.com/go/go1.18.1.linux-amd64.tar.gz -O - | sudo tar -xz -C /usr/local
RUN ln -s /usr/local/go/bin/go /usr/local/bin
RUN go install github.com/google/go-jsonnet/cmd/jsonnet@latest
RUN go install -a github.com/jsonnet-bundler/jsonnet-bundler/cmd/jb@latest
RUN ln -s $(go env GOPATH)/bin/jsonnet /usr/local/bin
RUN ln -s $(go env GOPATH)/bin/jb /usr/local/bin
RUN git clone https://github.com/git/git.git
RUN cd git && git checkout v2.38.1 && sudo make prefix=/usr/local all && sudo make prefix=/usr/local install
RUN curl -sSL https://rover.apollo.dev/nix/latest | sh
RUN corepack enable
RUN corepack prepare --activate yarn@stable
RUN curl -fsSL https://d2lang.com/install.sh | sh -s --
