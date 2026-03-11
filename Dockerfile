FROM node:22-alpine

WORKDIR /app

COPY src/package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN mkdir -p public

EXPOSE 3001

ENV PORT=3001

CMD ["node", "index.js"]
