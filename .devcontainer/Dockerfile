FROM ubuntu:20.04
ENV DEBIAN_FRONTEND=noninteractive
USER root

RUN apt update -y
RUN apt-get install -y \
    curl \
    gpg \
    wget \
    software-properties-common
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
RUN echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | tee -a /etc/apt/sources.list.d/kubernetes.list
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN curl -sS https://download.docker.com/linux/ubuntu/gpg | apt-key add -
RUN echo "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable" | tee -a /etc/apt/sources.list.d/docker.list
RUN echo "deb http://ppa.launchpad.net/ansible/ansible/ubuntu focal main"
RUN apt-add-repository -y --update ppa:ansible/ansible
RUN add-apt-repository -y --update ppa:deadsnakes/ppa
RUN curl -fsSL https://apt.releases.hashicorp.com/gpg | apt-key add -
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys DA418C88A3219F7B
RUN apt-add-repository -y --update "deb [arch=$(dpkg --print-architecture)] https://apt.releases.hashicorp.com $(lsb_release -cs) main"

RUN apt update -y
RUN apt-get upgrade -y

RUN apt-get remove docker docker-engine docker.io containerd

RUN apt-get install -y  \
    ansible \
    apt-transport-https \
    ca-certificates \
    docker-ce \
    gettext-base \
    gnupg2 \
    iptables \
    iputils-ping \
    jq \
    kubectl \
    lxc \
    net-tools \
    nodejs \
    python3-pip \
    python3.10 \
    python-apt \
    snmp \
    sudo \
    terraform \
    unzip \
    xsel \
    yarn 

RUN sudo curl -fL https://app.getambassador.io/download/tel2/linux/amd64/latest/telepresence -o /usr/local/bin/telepresence
RUN sudo chmod a+x /usr/local/bin/telepresence

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

ADD ./wrapdocker.sh /usr/local/bin/wrapdocker.sh
RUN chmod +x /usr/local/bin/wrapdocker.sh
VOLUME /var/lib/docker
RUN mkdir -p /etc/docker
RUN echo '{ "features": { "buildkit": true }, "exec-opts": [], "insecure-registries": ["docker-registry:5000"], "log-driver": "json-file", "log-opts": {"max-size": "10m", "max-file": "3"} }' > /etc/docker/daemon.json
RUN curl -fsSL -o velero.tar.gz https://github.com/vmware-tanzu/velero/releases/download/v1.5.3/velero-v1.5.3-linux-amd64.tar.gz
RUN tar -xvf velero.tar.gz
RUN mv velero-v1.5.3-linux-amd64/velero /usr/local/bin
RUN chmod +x /usr/local/bin/velero
RUN curl -fsSL -o helm.tar.gz  https://get.helm.sh/helm-v3.6.1-linux-amd64.tar.gz
RUN tar -zxvf helm.tar.gz
RUN mv linux-amd64/helm /usr/local/bin/helm
RUN curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
RUN rm -f ~/.ssh/environment
RUN wget -c https://dl.google.com/go/go1.18.1.linux-amd64.tar.gz -O - | sudo tar -xz -C /usr/local
RUN ln -s /usr/local/go/bin/go /usr/local/bin
RUN go install github.com/google/go-jsonnet/cmd/jsonnet@latest
RUN go install -a github.com/jsonnet-bundler/jsonnet-bundler/cmd/jb@latest
RUN ln -s $(go env GOPATH)/bin/jsonnet /usr/local/bin
RUN ln -s  $(go env GOPATH)/bin/jb /usr/local/bin