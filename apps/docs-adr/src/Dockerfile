FROM thomvaill/log4brains:latest

COPY docs/adr /workdir/docs/adr
COPY .log4brains.yml /workdir

ENTRYPOINT [ "log4brains", "preview" ]
