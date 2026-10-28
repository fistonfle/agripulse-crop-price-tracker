# Docker image for the AgriPulse frontend (React + Vite).
# Vite builds plain HTML, CSS and JS files, so nginx can serve them.
# Build it from the project root:  docker build -t agripulse-web ./frontend

# ---- Step 1: build the React app ----
FROM node:20-alpine3.21 AS build

WORKDIR /app

# Packages first so Docker can cache this step
COPY package.json package-lock.json ./

# Full install here, because Vite is a dev dependency and we need it to build
RUN npm ci

COPY . .

# Puts the finished files in /app/dist
RUN npm run build

# ---- Step 2: serve the files with nginx ----
# This is the official nginx image in the "unprivileged" version: it runs as
# the nginx user instead of root, and listens on port 8080.
FROM nginxinc/nginx-unprivileged:1.27-alpine

# My own config: serve the React files and send /api to the backend
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy only the built files from step 1
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

# Docker checks that the page loads
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:8080/ || exit 1
