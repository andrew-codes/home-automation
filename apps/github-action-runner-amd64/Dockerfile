FROM summerwind/actions-runner:latest
ENV DEBIAN_FRONTEND=noninteractive

RUN sudo apt update -y
RUN curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -
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
  nodejs \
  yarn \
  docker-ce \
  apt-transport-https gnupg2 kubectl \
  lxc ca-certificates iptables \
  software-properties-common ansible python3.8 python3-pip \
  etherwake
RUN pip3 install "pywinrm>=0.3.0"
RUN export KUBECONFIG=/home/runner/.kube/config
RUN mkdir -p /home/runner/.docker
RUN sudo yarn global add lerna
RUN ansible-galaxy collection install ansible.windows
RUN ansible-galaxy collection install community.windows
RUN sudo wget https://github.com/containerd/containerd/releases/download/v1.4.3/containerd-1.4.3-linux-amd64.tar.gz
RUN sudo mkdir -p containerd
RUN sudo tar -xvf containerd-1.4.3-linux-amd64.tar.gz --directory containerd
RUN sudo mv containerd/bin/* /usr/bin
RUN sudo wget https://github.com/mikefarah/yq/releases/download/v4.6.3/yq_linux_amd64 -O /usr/bin/yq
RUN sudo chmod +x /usr/bin/yq