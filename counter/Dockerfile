FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY server.js ./

ENV PORT=3002
EXPOSE 3002

ENV DATA_DIR=/app/data
RUN mkdir -p /app/data

CMD ["node", "server.js"]
