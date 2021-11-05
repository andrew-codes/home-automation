FROM node:16.4.0-alpine

RUN apk update
RUN apk add \
    build-base \
    gcc \
    git
WORKDIR /
COPY . .
WORKDIR /build
RUN git clone https://github.com/iharosi/ps5-wake.git
WORKDIR /build/ps5-wake
RUN make
RUN cp ps5-wake /ps5-wake
WORKDIR /
ENTRYPOINT ["/start.sh"]