FROM node:18-alpine

ENV NODE_ENV=production

RUN mkdir -p /app
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

USER node

CMD ["npm", "start"]
