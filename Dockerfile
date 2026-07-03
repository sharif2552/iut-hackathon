FROM node:20-bookworm-slim AS deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
COPY discord-bot/package.json discord-bot/package.json

RUN npm ci

FROM deps AS backend

WORKDIR /app
COPY backend backend

EXPOSE 4000

CMD ["npm", "run", "dev", "--workspace", "backend"]

FROM deps AS frontend

WORKDIR /app
COPY frontend frontend

EXPOSE 5173

CMD ["npm", "run", "dev", "--workspace", "frontend", "--", "--host", "0.0.0.0"]
