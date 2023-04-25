FROM node:18-alpine


ENV NODE_ENV=production

RUN mkdir -p /app
RUN chown node /app

USER node

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --production

COPY . .

CMD ["npm", "start"]
