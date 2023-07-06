ARG CHROME_VERSION='114.0.5735.198-1'
ARG EDGE_VERSION='95.0.1020.38-1.x86_64'
ARG FIREFOX_VERSION='115.0-1'


FROM cypress/factory


WORKDIR /app
COPY . .


RUN npm install --save-dev cypress