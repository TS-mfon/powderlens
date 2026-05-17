FROM node:24-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/worker/package.json apps/worker/package.json
RUN npm install --workspace apps/worker

COPY apps/worker apps/worker
RUN npm run build -w apps/worker

CMD ["npm", "run", "start", "-w", "apps/worker"]
