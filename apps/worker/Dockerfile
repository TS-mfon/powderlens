FROM node:24-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/worker/package.json apps/worker/package.json
RUN npm install --workspace apps/worker

COPY apps/worker apps/worker
CMD ["npx", "tsx", "apps/worker/src/index.ts"]
