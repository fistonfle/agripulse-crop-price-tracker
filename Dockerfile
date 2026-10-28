# Docker image for the AgriPulse API (Express).
# Build it from the project root:  docker build -t agripulse-api .

# ---- Step 1: install the packages ----
# node:20-alpine3.21 is an exact version (not "node:latest"), so the build
# always uses the same Node and the same small Alpine Linux base.
FROM node:20-alpine3.21 AS deps

WORKDIR /app

# Copy package.json first. Docker caches this step, so it only installs
# again when the packages change, not every time I edit the code.
COPY backend/package.json backend/package-lock.json ./

# npm ci installs the exact versions from package-lock.json.
# --omit=dev skips Jest and ESLint, which the running API does not need.
RUN npm ci --omit=dev

# ---- Step 2: the image that actually runs ----
FROM node:20-alpine3.21

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app

# Copy the packages from step 1 instead of installing them again
COPY --from=deps /app/node_modules ./node_modules

# Copy the app: package.json, the code, the SQL files and the setup script
COPY backend/package.json ./
COPY backend/src ./src
COPY backend/db ./db
COPY backend/scripts ./scripts

# The node image already has a normal user called "node".
# Using it means the API does not run as root, which is safer.
USER node

# The API listens on this port
EXPOSE 3000

# Docker checks /health to see if the container is working
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Start the API
CMD ["node", "src/server.js"]
