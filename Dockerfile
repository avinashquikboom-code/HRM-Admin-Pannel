# Multi-stage Dockerfile for HRM Admin Panel (Next.js standalone)

# ---------- deps ----------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# ---------- builder ----------
FROM node:22-alpine AS builder
WORKDIR /app

# No NEXT_PUBLIC_* build args: the frontend calls same-origin /api/* and Next.js
# rewrites to the backend at runtime using BACKEND_API_URL (set in the runner via
# the VPS env file). Nothing about the backend URL is baked into the bundle.
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- runner ----------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# next start listens on this port; override with PORT if needed.
ENV PORT=3000
# Bind to all interfaces so the container is reachable on 127.0.0.1 (health
# checks) and the published port. Without this, Next standalone binds only to
# the container hostname/eth0 and 127.0.0.1 probes are refused.
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone output bundles only what is needed to run the server.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
