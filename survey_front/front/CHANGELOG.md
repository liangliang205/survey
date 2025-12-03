# Changelog

## v1.0.0 (2025-12-03)

### Highlights
- First official release of the Survey system frontend (Next.js).
- Survey creation, listing, preview, QR code generation, and submission flows validated in production.
- Admin dashboard: manage surveys, view insights, export data.
- Internationalization: `en`, `zh-CN` via `next-i18next`.
- File upload and static serving for QR codes and uploads.
- Authentication with NextAuth.

### Tech Stack
- Next.js, TypeScript, Prisma, PNPM.
- Container-ready with `Dockerfile` and `docker-compose`.
- Prisma-managed database schema with migrations in `prisma/migrations`.

### Initial Features
- Admin management, survey editor, QR code routes, export API, locales API.

### Stability
- E2E tested and verified on server environment.
