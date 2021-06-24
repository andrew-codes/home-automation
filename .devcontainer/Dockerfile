FROM ubuntu:20.04
ENV DEBIAN_FRONTEND=noninteractive

RUN apt update -y
RUN apt-get install -y \
    curl \
    wget \
    software-properties-common
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
RUN curl -fsSL https://apt.releases.hashicorp.com/gpg | apt-key add -
RUN curl -s https://packagecloud.io/install/repositories/datawireio/telepresence/script.deb.sh | bash

RUN echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | tee -a /etc/apt/sources.list.d/kubernetes.list
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN curl -sS https://download.docker.com/linux/ubuntu/gpg | apt-key add -
RUN echo "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable" | tee -a /etc/apt/sources.list.d/docker.list
RUN echo "deb http://ppa.launchpad.net/ansible/ansible/ubuntu focal main"
RUN apt-add-repository -y --update ppa:ansible/ansible
RUN add-apt-repository ppa:deadsnakes/ppa
RUN apt-add-repository "deb [arch=$(dpkg --print-architecture)] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
RUN apt update -y

RUN apt-get remove docker docker-engine docker.io containerd

RUN apt-get install -y \
    jq \
    terraform \
    vault \
    nodejs \
    yarn \
    docker-ce \
    apt-transport-https \
    gnupg2 \
    kubectl \
    lxc \
    ca-certificates \
    iptables \
    ansible \
    python3.8 \
    python3-pip
RUN apt install -y --no-install-recommends telepresence
RUN setcap cap_ipc_lock= /usr/bin/vault

RUN pip3 install "pywinrm>=0.3.0"
RUN export KUBECONFIG=/home/root/.kube/config
RUN ansible-galaxy collection install ansible.windows
RUN ansible-galaxy collection install community.windows
RUN wget https://github.com/containerd/containerd/releases/download/v1.4.3/containerd-1.4.3-linux-amd64.tar.gz
RUN mkdir -p containerd
RUN tar -xvf containerd-1.4.3-linux-amd64.tar.gz --directory containerd
RUN mv containerd/bin/* /usr/bin
RUN wget https://github.com/mikefarah/yq/releases/download/v4.6.3/yq_linux_amd64 -O /usr/bin/yq
RUN chmod +x /usr/bin/yq
RUN mkdir -p /usr/local/bin
RUN ln -s /usr/bin/gpg /usr/local/bin/gpg
RUN mkdir -p /root/.kube