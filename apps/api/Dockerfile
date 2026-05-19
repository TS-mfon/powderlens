FROM node:24-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
RUN npm install --workspace apps/api

COPY apps/api apps/api
CMD ["npx", "tsx", "apps/api/src/server.ts"]
