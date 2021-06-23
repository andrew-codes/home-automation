FROM jakowenko/double-take:0.6.3
COPY ./config.yml /double-take/config.yml

CMD ["/bin/sh" "-c" "envsubst < /double-take/config.yml > /double-take/config.yml && nodemon --watch config.yml api/server.js"]