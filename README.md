# Medicare — Healthcare Server (Backend)

REST API for the Medicare telemedicine platform: doctor booking, schedules, video consultations, payments, prescriptions, reviews, and role-based dashboards.

- **Live API:** https://healthcare-server-eta.vercel.app/api/v1
- **Frontend:** https://medicare-ten-plus.vercel.app ([repo folder: `healthcare-frontend`](../healthcare-frontend))

## Tech stack

| Layer        | Technology                                             |
| ------------ | ------------------------------------------------------ |
| Runtime      | Node.js + TypeScript (CommonJS)                        |
| Framework    | Express 5                                              |
| Database     | PostgreSQL ([Neon](https://neon.tech) in production)   |
| ORM          | Prisma 7 with `@prisma/adapter-pg` driver adapter      |
| Auth         | JWT (access + refresh tokens), bcrypt password hashing |
| Validation   | Zod                                                    |
| File storage | Cloudinary (staged via Multer)                         |
| Payments     | SSLCommerz (sandbox)                                   |
| Email        | Nodemailer (Gmail app password) — password reset       |
| Scheduling   | node-cron locally / Vercel Cron in production          |
| Hosting      | Vercel serverless functions                            |

## Getting started

```bash
cd healthcare-server
npm install            # also runs `prisma generate` (postinstall)
# create .env — see "Environment variables" below
npx prisma migrate deploy
npm run dev            # http://localhost:5000
```

On first boot the server seeds a **super admin** account from `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`.

### Scripts

| Script                   | What it does                                               |
| ------------------------ | ---------------------------------------------------------- |
| `npm run dev`            | Dev server with reload (`ts-node-dev`)                     |
| `npm run build`          | Compile TypeScript to `dist/`                              |
| `npm start`              | Run the compiled server (`dist/server.js`)                 |
| `npm run seed`           | Seed the super admin manually                              |
| `npm run migrate:deploy` | Apply Prisma migrations                                    |
| `npm run vercel-build`   | Used by Vercel: `prisma generate && prisma migrate deploy` |

## Environment variables

| Variable                                                                 | Purpose                                                                                                            |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `NODE_ENV`                                                               | `development` / `production` (production enables cross-site cookies: `SameSite=None; Secure`)                      |
| `PORT`                                                                   | Local port (default 5000)                                                                                          |
| `DATABASE_URL`                                                           | **Pooled** Postgres URL — used by the app at runtime                                                               |
| `DIRECT_URL`                                                             | **Direct** (non-pooled) Postgres URL — used by Prisma migrations (Neon's PgBouncer pooler breaks `prisma migrate`) |
| `SUPER_ADMIN_EMAIL` / `SUPER_ADMIN_PASSWORD`                             | Seeded super admin credentials                                                                                     |
| `JWT_ACCESS_TOKEN` / `ACCESS_TOKEN_EXPIRE_IN`                            | Access-token secret + lifetime                                                                                     |
| `JWT_REFRESH_TOKEN` / `REFRESH_TOKEN_EXPIRE_IN`                          | Refresh-token secret + lifetime (httpOnly cookie)                                                                  |
| `RESET_PASS_TOKEN` / `RESET_PASS_EXPIRE_IN` / `RESET_PASS_URL`           | Password-reset token + frontend reset page URL                                                                     |
| `EMAIL` / `APP_PASS`                                                     | Nodemailer sender (Gmail app password)                                                                             |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Image uploads                                                                                                      |
| `STORE_ID` / `STORE_PASSWORD` / `PAYMENT_API` / `VALIDATION_API`         | SSLCommerz credentials + endpoints                                                                                 |
| `SUCCESS_URL` / `CANCEL_URL` / `FAIL_URL`                                | Payment redirect URLs (point at this server's `/api/v1/payment/...`)                                               |
| `FRONTEND_URL`                                                           | Deployed frontend origin                                                                                           |
| `BACKEND_BASE_URL`                                                       | This server's own base URL (`.../api/v1`)                                                                          |
| `CORS_ORIGINS`                                                           | Comma-separated allowed browser origins                                                                            |
| `COMMISSION_RATE`                                                        | Optional. Platform commission on doctor fees — defaults to `0.15` (see below)                                      |
| `CRON_SECRET`                                                            | Protects the Vercel Cron endpoint (`Authorization: Bearer <secret>`)                                               |

## Commission system

When a patient pays an appointment fee, the platform keeps a commission and the doctor earns the rest.

- The rate lives in **one place**: `src/config/index.ts` → `commissionRate` (default `0.15`, overridable with the `COMMISSION_RATE` env var).
- `src/app/modules/meta/meta.service.ts` → `calculateEarnings(gross)` is the single function that computes the split — `{ gross, commission, net, commissionRate }` — over **PAID payments only**.
- `GET /meta` returns the split for admins/super admins (platform-wide) and doctors (their own appointments); both dashboards read it from there. The rate is never hardcoded in the frontend.

## API overview

Base path: `/api/v1`

| Module          | Path                                   | Highlights                                                                                                                |
| --------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Auth            | `/auth`                                | Login (sets refresh cookie), refresh token, change/forgot/reset password                                                  |
| User            | `/user`                                | Create admin/doctor/patient, list users, profile (`/me`), status & profile updates                                        |
| Admin           | `/admin`                               | Admin CRUD (super admin manages admins)                                                                                   |
| Doctor          | `/doctor`                              | Doctor CRUD, search/filter by specialty                                                                                   |
| Patient         | `/patient`                             | Patient CRUD incl. health data & medical reports                                                                          |
| Specialties     | `/specialties`                         | Specialty CRUD (icon upload to Cloudinary)                                                                                |
| Schedule        | `/schedule`                            | Admin-generated time slots                                                                                                |
| Doctor schedule | `/doctor-schedule`                     | Doctors claim/release slots                                                                                               |
| Appointment     | `/appointment`                         | Book (generates a `videoCallingId`), list mine, change status                                                             |
| Payment         | `/payment`                             | SSLCommerz init + IPN/success/cancel/fail callbacks                                                                       |
| Prescription    | `/prescription`                        | Doctor issues, patient views                                                                                              |
| Review          | `/review`                              | Patient reviews completed appointments; updates doctor rating                                                             |
| Meta            | `/meta`                                | Role-aware dashboard stats: counts, revenue, **earnings split**, charts, `/meta/appointment-trend?unit=year\|month\|week` |
| Cron            | `/api/cron/cancel-unpaid-appointments` | Cancels unpaid appointments; called by Vercel Cron (requires `CRON_SECRET`), runs in-process via node-cron locally        |

Unpaid appointments are auto-cancelled (slot released, appointment + payment marked cancelled) after the payment window passes.

## Project structure

```
src/
├── app.ts                  # Express app: CORS, parsers, routes, cron, error handling
├── server.ts               # Local entry (app.listen)
├── config/index.ts         # All env-driven config incl. commissionRate
├── app/
│   ├── router/             # Mounts every module under /api/v1
│   ├── middlewares/        # auth (JWT + role guard), validateRequest, globalErrorHandler
│   ├── modules/<feature>/  # <feature>.routes.ts / .controller.ts / .service.ts / .validation.ts
│   ├── errors/             # ApiError + Prisma error mappers
│   └── interfaces/         # Shared TS types
├── helpers/                # fileUploader (Multer→Cloudinary), paginationHelpers, jwtHelpers
└── shared/                 # prisma client (pg adapter), seed, catchAsync, sendResponse
api/index.ts                # Vercel serverless entry (exports the Express app)
prisma/
├── schema.prisma           # Models: User, Admin, Doctor, Patient, Specialties,
│                           # Schedule, DoctorSchedule, Appointment, Payment,
│                           # Prescription, Review, …
└── migrations/
```

## Deployment (Vercel + Neon)

The repo is pre-configured — `vercel.json` rewrites all routes to the serverless function (`api/index.ts`), runs migrations on every build, and registers the daily cron.

1. Create a Neon project; copy the **pooled** and **direct** connection strings.
2. Set all environment variables on the Vercel project (Settings → Environment Variables).
3. Deploy: `npx vercel --prod`.

Serverless caveats already handled in code:

- **Uploads** are staged in the OS temp dir (`/tmp`) — the rest of the filesystem is read-only.
- **node-cron** does not run on Vercel; the cron endpoint + `vercel.json` `crons` replaces it (Hobby plan: max once/day).
- **ESM-only packages** crash the CommonJS bundle (`ERR_REQUIRE_ESM`) — e.g. `uuid` was replaced with Node's built-in `crypto.randomUUID()`. Check new deps before adding.
- **Refresh cookie** is `SameSite=None; Secure` in production because the frontend lives on a different domain.
