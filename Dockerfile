# Production image for the Next.js app. Supabase is NOT in this image: it runs
# as its own Docker stack via `npx supabase start` (see compose.yaml).

FROM node:24-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:24-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000
# socat forwards the container's 127.0.0.1:54321 to the host's Supabase, so
# SUPABASE_URL stays http://127.0.0.1:54321 as on the host. That keeps the
# auth cookie name (sb-127-auth-token) and the OAuth redirect URLs the same.
RUN apt-get update && apt-get install -y --no-install-recommends socat \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
# Owned by `node`: next start writes its image cache under .next/cache.
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./next.config.ts
USER node
EXPOSE 3000
CMD ["sh", "-c", "socat TCP-LISTEN:54321,fork,reuseaddr,bind=127.0.0.1 TCP:host.docker.internal:54321 & exec npm start"]
