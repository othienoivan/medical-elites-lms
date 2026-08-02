FROM node:20-bookworm-slim

ENV NODE_ENV=production \
    HOME=/tmp

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      libreoffice-impress \
      libreoffice-writer \
      libreoffice-core \
      fonts-dejavu-core \
      fonts-liberation \
      fonts-noto-core \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY src ./src

USER node
CMD ["npm", "start"]
