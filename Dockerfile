FROM node:22-alpine AS builder

WORKDIR /app
RUN corepack enable

COPY package.json yarn.lock ./
COPY apps/api/package.json apps/api/package.json
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn workspace observatoire-api build

FROM node:22-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable

COPY --from=builder /app/package.json /app/yarn.lock ./
COPY --from=builder /app/apps/api/package.json apps/api/package.json
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/apps/api/dist apps/api/dist
COPY --from=builder /app/apps/api/prisma apps/api/prisma

EXPOSE 3001
CMD ["node", "apps/api/dist/main.js"]
