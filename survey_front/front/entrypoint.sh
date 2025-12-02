#!/bin/sh
set -e

# Ensure writable permissions for mounted volumes when running as non-root user
# Some Docker volume drivers create root-owned dirs; adjust ownership for UID 1001
if [ -d "/app/prisma" ]; then
  chown -R 1001:1001 /app/prisma || true
fi
if [ -d "/app/public/uploads" ]; then
  chown -R 1001:1001 /app/public/uploads || true
fi
if [ -d "/app/public/qrcodes" ]; then
  chown -R 1001:1001 /app/public/qrcodes || true
fi

# Start the Next.js server; prefer dropping to non-root if su-exec exists
if command -v su-exec >/dev/null 2>&1; then
  exec su-exec nextjs node server.js
else
  echo "[entrypoint] su-exec not found; running as root (temporary fallback)"
  exec node server.js
fi
