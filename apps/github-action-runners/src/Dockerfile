FROM summerwind/actions-runner:ubuntu-22.04
ENV DEBIAN_FRONTEND=noninteractive
ENV OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES
USER root
RUN apt update -y
RUN apt-get install \
  apt-transport-https wget
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN curl -s https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -
RUN echo "deb https://apt.kubernetes.io/ kubernetes-xenial main" | tee -a /etc/apt/sources.list.d/kubernetes.list
RUN apt-add-repository -y --update ppa:ansible/ansible
RUN add-apt-repository ppa:deadsnakes/ppa
RUN wget "https://packages.microsoft.com/config/ubuntu/$(if command -v lsb_release &>/dev/null; then lsb_release -r -s; else grep -oP '(?<=^VERSION_ID=).+' /etc/os-release | tr -d '"'; fi)/packages-microsoft-prod.deb" -O packages-microsoft-prod.deb
RUN dpkg -i packages-microsoft-prod.deb
RUN rm packages-microsoft-prod.deb
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 40976EAF437D05B5 3B4FE6ACC0B21F32
RUN echo "deb http://security.ubuntu.com/ubuntu xenial-security main" >>/etc/apt/sources.list
RUN apt update -y
RUN apt-get install -y \
  ansible \ 
bash \
  dbus-user-session \
  dotnet-runtime-7.0 \
  dotnet-sdk-7.0 \
  etherwake \
  gettext-base \
  libssl1.0.0 libssl-dev \
  gnupg2 \
  jq \
  kubectl \
  locales \
  lxc ca-certificates iptables \
  nodejs \
  python3-pip \
  python3.8 \
  sshpass \
  software-properties-common
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen
RUN locale-gen
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8
RUN pip3 install "pywinrm>=0.3.0"
RUN export KUBECONFIG=/home/runner/.kube/config
RUN mkdir -p /etc/docker
RUN echo '{ "features": { "buildkit": true }, "exec-opts": [], "log-driver": "json-file", "log-opts": {"max-size": "10m", "max-file": "3"} }' | tee /etc/docker/daemon.json
RUN ansible-galaxy collection install ansible.windows
RUN ansible-galaxy collection install community.windows
RUN wget https://github.com/containerd/containerd/releases/download/v1.5.15/containerd-1.5.15-linux-amd64.tar.gz
RUN mkdir -p containerd
RUN tar -xvf containerd-1.5.15-linux-amd64.tar.gz --directory containerd
RUN mv containerd/bin/* /usr/bin
RUN wget https://github.com/mikefarah/yq/releases/download/v4.6.3/yq_linux_amd64 -O /usr/local/bin/yq
RUN chmod +x /usr/local/bin/yq
RUN curl -fsSL -o helm.tar.gz https://get.helm.sh/helm-v3.6.1-linux-amd64.tar.gz
RUN tar -zxvf helm.tar.gz
RUN mv linux-amd64/helm /usr/local/bin/helm
RUN chmod +x /usr/local/bin/helm
RUN wget -c https://dl.google.com/go/go1.18.1.linux-amd64.tar.gz -O - | tar -xz -C /usr/local
RUN ln -s /usr/local/go/bin/go /usr/local/bin
RUN go install github.com/google/go-jsonnet/cmd/jsonnet@latest
RUN go install -a github.com/jsonnet-bundler/jsonnet-bundler/cmd/jb@latest
RUN ln -s $(go env GOPATH)/bin/jsonnet /usr/local/bin
RUN ln -s $(go env GOPATH)/bin/jb /usr/local/bin
RUN curl -Os https://uploader.codecov.io/latest/linux/codecov
RUN chmod +x codecov
RUN ln -s codecov /usr/local/bin
RUN curl -sSL https://rover.apollo.dev/nix/latest | sh
RUN mkdir -p /home/runner/.docker
RUN mkdir -p /home/runner/.config/docker
RUN mkdir -p /home/runner/.cache/node/corepack
RUN chown --recursive runner /home/runner
RUN corepack enable
RUN corepack prepare yarn@stable --activate
RUN chown --recursive runner /home/runner

USER runner
RUN echo '{ "features": { "buildkit": true }, "exec-opts": [], "log-driver": "json-file", "log-opts": {"max-size": "10m", "max-file": "3"} }' | tee /home/runner/.config/docker/daemon.json
