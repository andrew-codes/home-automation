FROM mongo:focal

COPY src/mongod.conf /etc/mongo/mongod.conf

ENTRYPOINT [ "mongod", "--config", "/etc/mongo/mongod.conf" ]