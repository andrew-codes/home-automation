FROM nvidia/cuda:11.7.1-cudnn8-runtime-ubuntu20.04

# Install Whisper
WORKDIR /usr/src
ARG WHISPER_VERSION='2.0.0'

RUN apt-get update
RUN apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    python3-dev \
    python3-pip
RUN pip3 install --no-cache-dir -U \
    setuptools \
    wheel
RUN pip3 install --no-cache-dir \
    "wyoming-faster-whisper==${WHISPER_VERSION}"
RUN apt-get purge -y --auto-remove \
    build-essential \
    python3-dev
RUN rm -rf /var/lib/apt/lists/*

WORKDIR /
COPY src/run.sh ./

ENV LD_LIBRARY_PATH /usr/lib/x86_64-linux-gnu

ENTRYPOINT ["bash", "/run.sh"]
