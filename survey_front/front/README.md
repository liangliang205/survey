This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Production Deployment (SQLite Minimal)

### 1. Server Preparation
Install Docker & docker compose on an Ubuntu 22.04 server; ensure a non-root user is in the `docker` group.

### 2. Environment Variables
Create a `.env` based on `.env.example`:
```
DATABASE_URL=file:./prisma/dev.db
NEXTAUTH_SECRET=<openssl rand -hex 32>
NEXTAUTH_URL=https://your-domain.com
```

### 3. Generate Migrations Locally
Run:
```
pnpm prisma migrate dev --name remove_option_label
pnpm prisma generate
```
Commit the new migration folder and push to server.

### 4. Build & Run
```
docker compose build
docker compose up -d
```

### 5. Reverse Proxy & HTTPS
Use Nginx / Caddy to terminate TLS and proxy to `survey-app:3000`. Set `NEXTAUTH_URL` to the HTTPS domain.

### 6. Backup Strategy
Periodically archive volumes:
- SQLite file volume `sqlite_data`
- Uploads volume `uploads`
 - QR codes volume `qrcodes`

### 7. Optional: Upgrade to PostgreSQL
Add a PostgreSQL service in `docker-compose.yml`, update `DATABASE_URL` to a Postgres connection string, then run `pnpm prisma migrate deploy` in the container.

### 8. Health & Logs
```
docker compose ps
docker logs -f survey-app
```

### 9. Security Quick Wins
- Strong `NEXTAUTH_SECRET`
- Restrict open ports (80/443 only)
- Regular dependency updates
- Enforce HTTPS redirects

### Next Steps
Add monitoring (Watchtower/Prometheus) or CI pipeline as traffic grows.

## Local Docker (SQLite on Windows)

### 1) Prereqs
- Install Docker Desktop for Windows and ensure it is running.

### 2) Build image
```powershell
docker compose build
```

### 3) Initialize DB (migrations + seed)
- This runs once to create `dev.db` and a default admin.
```powershell
docker compose run --rm migrate
```

### 4) Start app
```powershell
docker compose up -d
```

### 5) Check logs and open
```powershell
docker compose logs -f survey-app
```
Visit http://localhost:3000

Default admin account (from seed):
- Username: `admin`
- Password: `admin123`

### Notes
- Volumes persisted locally: `sqlite_data` (SQLite DB), `uploads` (uploaded files), `qrcodes` (generated QR images).
- Change `NEXTAUTH_SECRET` in `docker-compose.yml` or copy `.env.example` to `.env` and set your own values for local use.
