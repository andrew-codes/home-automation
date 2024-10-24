FROM ghcr.io/coder/coder AS base

FROM alpine:3.20.3

USER root
RUN mkdir -p /lib/modules
RUN apk add --no-cache \
    bash \
    curl \
    git \
    openssh-client \
    openssl \
    wget

RUN wget -O /tmp/terraform.zip "https://releases.hashicorp.com/terraform/1.9.2/terraform_1.9.2_linux_amd64.zip"
RUN busybox unzip /tmp/terraform.zip -d /usr/local/bin
RUN rm -f /tmp/terraform.zip
RUN chmod +x /usr/local/bin/terraform
RUN terraform --version

ARG CODER_VERSION
LABEL \
    org.opencontainers.image.title="Coder" \
    org.opencontainers.image.description="A tool for provisioning self-hosted development environments with Terraform." \
    org.opencontainers.image.url="https://github.com/coder/coder" \
    org.opencontainers.image.source="https://github.com/coder/coder" \
    org.opencontainers.image.version="$CODER_VERSION"

COPY --from=base --chown=root --chmod=755 /opt/coder /opt/coder
ENTRYPOINT [ "/opt/coder", "server" ]
