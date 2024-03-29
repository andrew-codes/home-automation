FROM summerwind/actions-runner:ubuntu-22.04
ENV DEBIAN_FRONTEND=noninteractive
ENV OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES
USER root
RUN apt update -y
RUN apt-get install -y \
  apt-transport-https wget software-properties-common
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
RUN echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /" | tee /etc/apt/sources.list.d/kubernetes.list
RUN curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
RUN add-apt-repository -y --update ppa:ansible/ansible
RUN add-apt-repository ppa:deadsnakes/ppa
RUN curl -sS https://packages.microsoft.com/keys/microsoft.asc | (OUT=$(apt-key add - 2>&1) || echo $OUT)
RUN curl https://packages.microsoft.com/config/ubuntu/22.04/prod.list | tee /etc/apt/sources.list.d/msprod.list
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 40976EAF437D05B5 3B4FE6ACC0B21F32
RUN echo "deb http://security.ubuntu.com/ubuntu xenial-security main" >>/etc/apt/sources.list

RUN apt update -y --fix-missing
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
  sshpass
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
RUN corepack prepare yarn@4.1.1 --activate
RUN chown --recursive runner /home/runner
RUN apt-get install -y \
dirmngr
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF
RUN echo "deb https://download.mono-project.com/repo/ubuntu stable-focal main" > /etc/apt/sources.list.d/mono-official-stable.list
RUN apt-get update -y
RUN apt-get install -y \
mono-complete \
nuget \
git-lfs
RUN git lfs install

USER runner
RUN echo '{ "features": { "buildkit": true }, "exec-opts": [], "log-driver": "json-file", "log-opts": {"max-size": "10m", "max-file": "3"} }' | tee /home/runner/.config/docker/daemon.json