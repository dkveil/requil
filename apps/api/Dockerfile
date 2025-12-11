FROM node:22-alpine AS base

RUN corepack enable && corepack prepare pnpm@10.6.5 --activate

WORKDIR /app

FROM base AS builder

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc turbo.json ./
COPY packages ./packages
COPY apps/api ./apps/api

RUN pnpm install --frozen-lockfile --ignore-scripts

RUN pnpm build

RUN pnpm turbo build --filter=api...

FROM node:22-alpine AS runner

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.6.5 --activate

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 fastify

USER fastify

COPY --from=builder --chown=fastify:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=fastify:nodejs /app/apps/api ./apps/api
COPY --from=builder --chown=fastify:nodejs /app/packages ./packages

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["node", "dist/index.js"]
