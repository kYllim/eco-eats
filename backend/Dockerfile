FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache openssl bash

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && (test -f dist/main.js && node dist/main.js || node dist/src/main.js)"]
