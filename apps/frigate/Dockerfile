FROM blakeblackshear/frigate:0.11.0
RUN apt-get update -y
RUN apt-get install -y \
    curl

RUN echo "deb https://packages.cloud.google.com/apt coral-edgetpu-stable main" | tee /etc/apt/sources.list.d/coral-edgetpu.list
RUN curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | apt-key add -

RUN apt-get update -y
RUN apt-get install -y \
    gettext-base \
    libedgetpu1-std \
    python3-pycoral \
    usbutils
COPY config.yml /config/config-raw.yml
COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]