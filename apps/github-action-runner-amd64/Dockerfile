FROM summerwind/actions-runner:latest
ENV DEBIAN_FRONTEND=noninteractive

RUN sudo apt update -y
RUN curl -sL https://deb.nodesource.com/setup_14.x | sudo bash -
RUN curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
RUN echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee -a /etc/apt/sources.list.d/kubernetes.list
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
RUN sudo apt update -y
RUN sudo apt-get install -y \
  nodejs \
  yarn \
  apt-transport-https gnupg2 kubectl \
  lxc ca-certificates iptables
RUN export KUBECONFIG=/home/runner/.kube/config
RUN mkdir -p /home/runner/.docker
RUN sudo yarn global add lerna
