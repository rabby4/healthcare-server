import "dotenv/config"
import { defineConfig, env } from "prisma/config"

// This file sits outside tsconfig's `include` (src/**), so the editor may not
// load the Node global types for it. Declare the one global we use — the real
// `process` exists at runtime when the Prisma CLI loads this config.
declare const process: { env: Record<string, string | undefined> }

export default defineConfig({
	schema: "prisma/schema.prisma",
	migrations: {
		path: "prisma/migrations",
	},
	datasource: {
		// Migrations must run over a DIRECT (non-pooled) connection — Neon's
		// pooler (PgBouncer) breaks `prisma migrate`. The runtime client uses
		// the pooled DATABASE_URL via the pg adapter (src/shared/prisma.ts).
		// Falls back to DATABASE_URL for local databases without a pooler.
		url: process.env.DIRECT_URL ?? env("DATABASE_URL"),
	},
})
