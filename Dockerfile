ARG CHROME_VERSION='114.0.5735.198-1'

FROM cypress/factory

WORKDIR /app
COPY . .

RUN npm ci --save-dev cypress