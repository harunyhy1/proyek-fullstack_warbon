# Warkop Si Bontot — Repo Guide for Agents

## Project

Full-stack coffee shop ordering app. Two independent packages, **no root workspace**, no monorepo tooling.

## Commands

| Location | Command | Action |
|----------|---------|--------|
| `backend/` | `npm run dev` | Nodemon dev server on port **5000** |
| `backend/` | `npm start` | Production server on port **5000** |
| `frontend/warkop_frontend/` | `npm run dev` | Vite dev server on port **3000** (proxies `/api` → `localhost:5000`) |
| `frontend/warkop_frontend/` | `npm run build` | `vite build` production bundle |
| `frontend/warkop_frontend/` | `npm run lint` | ESLint (⚠️ no config file exists) |

Both servers must run simultaneously during development.

## Architecture

- **Backend**: Express 5, CommonJS (`require`/`module.exports`), entry `backend/src/app.js`
  - MySQL/MariaDB via `mysql2`, schema in `schema.sql`
  - JWT auth (1h expiry, stored in `localStorage`), bcryptjs salt rounds = 10
  - Auth routes at `/api/auth/*`, API routes at `/api/*`
- **Frontend**: React 19, Vite 8, JavaScript (JSX), ESM. No TypeScript.
  - Entry `frontend/warkop_frontend/src/main.jsx`
  - API layer in `src/api.js` — uses native `fetch`, hardcodes `BASE = 'http://localhost:5000/api'`
  - Plain CSS (Bootstrap via CDN on landing page only)
- **No tests**, no CI/CD, no formatter config, no `.gitignore`

## Routes

**Public**: `GET /menu`, `GET /menu/:id`, `GET /kategori`, `POST /orders`, `POST /transaksi`
**Admin** (JWT + role `admin`): `POST/PUT/DELETE /menu/:id`, `GET /orders`, `GET /transaksi`, `GET /dashboard/overview`
**Auth**: `POST /auth/register`, `POST /auth/login`
**Upload**: `POST /api/upload` (multipart, field `gambar`, max 2 MB, types: jpg/png/gif/webp)

## Storage

- Uploaded images stored at `backend/public/uploads/`, served at `/uploads/` (localhost:5000)
- `menu.gambar` column stores the filename; `orders.nama_pemesan` stores the customer name for guest orders

## Seed Data

- `backend/seed.sql` contains 5 categories and 43 menu items with image filenames
- `backend/schema.sql` complete table definitions (drop & recreate all)
- To reset DB: `node backend/reset_db.js`
- 43 menu images pre-downloaded in `backend/public/uploads/`

## Default Admin

- Email: `admin@warkop.com`
- Password: `password123`
- Role: `admin`

## Constraints

- `backend/.env` must exist with DB credentials and `JWT_SECRET`
- No automated testing — verify manually via dev server
- ESLint has no config file; `npm run lint` may fail or use defaults
