FROM node:24-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
RUN npm install --workspace apps/api

COPY apps/api apps/api
RUN npm run build -w apps/api

CMD ["npm", "run", "start", "-w", "apps/api"]
