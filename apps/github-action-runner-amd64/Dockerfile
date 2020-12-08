FROM ubuntu:xenial

ENV DEBIAN_FRONTEND=noninteractive
RUN apt update -y
RUN apt install -y software-properties-common
RUN add-apt-repository -y ppa:git-core/ppa
RUN apt update -y
RUN apt install -y --no-install-recommends \
  build-essential \
  curl \
  ca-certificates \
  dnsutils \
  ftp \
  git \
  iproute2 \
  iputils-ping \
  jq \
  libunwind8 \
  locales \
  netcat \
  openssh-client \
  parallel \
  rsync \
  shellcheck \
  sudo \
  telnet \
  time \
  tzdata \
  unzip \
  upx \
  wget \
  zip \
  zstd
RUN rm -rf /var/lib/apt/lists/*

RUN curl -L -o docker.tgz https://download.docker.com/linux/static/stable/x86_64/docker-19.03.12.tgz
RUN tar zxvf docker.tgz
RUN install -o root -g root -m 755 docker/docker /usr/local/bin/docker
RUN rm -rf docker docker.tgz
RUN curl -L -o /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64
RUN chmod +x /usr/local/bin/dumb-init
RUN adduser --disabled-password --gecos "" --uid 1000 runner
RUN usermod -aG sudo runner
RUN echo "%sudo   ALL=(ALL:ALL) NOPASSWD:ALL" >/etc/sudoers

RUN mkdir -p /runner
WORKDIR /runner
RUN curl -L -o runner.tar.gz https://github.com/actions/runner/releases/download/v2.274.2/actions-runner-linux-x64-2.274.2.tar.gz
RUN tar xzf ./runner.tar.gz
RUN rm runner.tar.gz
RUN ./bin/installdependencies.sh
RUN rm -rf /var/lib/apt/lists/*

COPY . .

USER runner:runner
RUN sudo chmod a+x ./dist/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/dumb-init", "--"]
CMD ["/runner/dist/entrypoint.sh"]

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
