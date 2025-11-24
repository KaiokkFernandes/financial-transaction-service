FROM node:18-alpine

# Instalar wget para health checks
RUN apk add --no-cache wget

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]