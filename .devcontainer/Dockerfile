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
    python3-pip \
    python3.11 \
    snmp \
    sshfs \
    sshpass \
    sudo \
    xsel

RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/library-scripts
RUN rm -f ~/.ssh/environment

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
RUN pip3 install "pywinrm>=0.3.0"
RUN pip3 install "PyYAML"
RUN ansible-galaxy collection install ansible.windows
RUN ansible-galaxy collection install community.windows
RUN ansible-galaxy collection install kubernetes.core

# go/ jsonnet
RUN curl -s https://dl.google.com/go/go1.18.1.linux-amd64.tar.gz | tar -xz -C /usr/local
RUN ln -s /usr/local/go/bin/go /usr/local/bin
RUN go install github.com/google/go-jsonnet/cmd/jsonnet@latest
RUN go install -a github.com/jsonnet-bundler/jsonnet-bundler/cmd/jb@latest
RUN ln -s $(go env GOPATH)/bin/jsonnet /usr/local/bin
RUN ln -s $(go env GOPATH)/bin/jb /usr/local/bin

RUN mkdir -p ~/.kube
COPY bash_profile_setup.sh /root/.bash_profile_setup.sh
RUN echo "source ~/.bash_profile_setup.sh" >>/root/.bashrc
RUN echo "source ~/.bash_profile_setup.sh" >>/root/.bash_profile

# yq
RUN curl https://github.com/mikefarah/yq/releases/download/v4.6.3/yq_linux_amd64 -o /usr/local/bin/yq
RUN chmod +x /usr/local/bin/yq

# helm
RUN curl -fsSL -o helm.tar.gz https://get.helm.sh/helm-v3.6.1-linux-amd64.tar.gz
RUN tar -zxvf helm.tar.gz
RUN mv linux-amd64/helm /usr/local/bin/helm
RUN chmod +x /usr/local/bin/helm

# updated git
RUN git clone https://github.com/git/git.git
RUN cd git && git checkout v2.38.1 && make prefix=/usr/local all && make prefix=/usr/local install