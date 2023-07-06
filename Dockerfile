ARG CHROME_VERSION='107.0.0'
ARG EDGE_VERSION='100.0.0'
ARG FIREFOX_VERSION='107.0'


FROM cypress/factory


WORKDIR /app
COPY . .


RUN npm install --save-dev cypress