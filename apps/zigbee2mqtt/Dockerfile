FROM koenkk/zigbee2mqtt:1.25.0

COPY ./src/configuration.yml /app/data/configuration-from-git.yml

RUN npm install -g @alexlafroscia/yaml-merge