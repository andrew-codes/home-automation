FROM summerwind/actions-runner:latest
ENV DEBIAN_FRONTEND=noninteractive

RUN sudo apt update -y
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | sudo bash -
RUN curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
RUN echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee -a /etc/apt/sources.list.d/kubernetes.list
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
RUN curl -sS https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
RUN echo "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable" | sudo tee -a /etc/apt/sources.list.d/docker.list
RUN sudo apt-add-repository -y --update ppa:ansible/ansible
RUN sudo add-apt-repository ppa:deadsnakes/ppa
RUN sudo apt update -y
RUN sudo apt-get remove docker docker-engine docker.io containerd
RUN sudo apt-get install -y \
  ansible \ 
  apt-transport-https \
  bash \
  docker-ce \
  etherwake \
  gettext-base \
  gnupg2 \
  jq \
  kubectl \
  lxc ca-certificates iptables \
  nodejs \
  python3-pip \
  python3.8 \
  software-properties-common \ 
  yarn 
RUN pip3 install "pywinrm>=0.3.0"
RUN export KUBECONFIG=/home/runner/.kube/config
RUN yarn global add lerna
RUN mkdir -p /home/runner/.docker
RUN sudo ansible-galaxy collection install ansible.windows
RUN sudo ansible-galaxy collection install community.windows
RUN sudo wget https://github.com/containerd/containerd/releases/download/v1.4.3/containerd-1.4.3-linux-amd64.tar.gz
RUN sudo mkdir -p containerd
RUN sudo tar -xvf containerd-1.4.3-linux-amd64.tar.gz --directory containerd
RUN sudo mv containerd/bin/* /usr/bin
RUN sudo wget https://github.com/mikefarah/yq/releases/download/v4.6.3/yq_linux_amd64 -O /usr/local/bin/yq
RUN sudo chmod +x /usr/local/bin/yq
RUN sudo curl -fsSL -o helm.tar.gz  https://get.helm.sh/helm-v3.6.1-linux-amd64.tar.gz
RUN sudo tar -zxvf helm.tar.gz
RUN sudo mv linux-amd64/helm /usr/local/bin/helm
RUN sudo chmod +x /usr/local/bin/helm
ADD ./wrapdocker.sh /usr/local/bin/wrapdocker.sh
RUN sudo chmod +x /usr/local/bin/wrapdocker.sh
ENV DOCKER_DAEMON_ARGS "--insecure-registry docker-registry:5000"
RUN curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
RUN wget -c https://dl.google.com/go/go1.18.1.linux-amd64.tar.gz -O - | sudo tar -xz -C /usr/local
RUN sudo ln -s /usr/local/go/bin/go /usr/local/bin
RUN go install github.com/google/go-jsonnet/cmd/jsonnet@latest
RUN go install -a github.com/jsonnet-bundler/jsonnet-bundler/cmd/jb@latest
RUN sudo ln -s $(go env GOPATH)/bin/jsonnet /usr/local/bin
RUN sudo ln -s  $(go env GOPATH)/bin/jb /usr/local/bin