import express, { Application, NextFunction, Request, Response } from "express"
import cors from "cors"
import router from "./app/router"
import globalErrorHandler from "./app/middlewares/globalErrorHandler"
import status from "http-status"
import cookieParser from "cookie-parser"
import { appointmentService } from "./app/modules/appointment/appointment.service"
import cron from "node-cron"
import { seedSuperAdmin } from "./shared/seed"

const app: Application = express()

// Ensure the super admin exists. Fire-and-forget with a catch — a failure
// here (e.g. DB briefly unreachable) must never crash the process/function.
seedSuperAdmin().catch((err) =>
	console.error("Super admin seeding failed:", err)
)

const allowedOrigins = (
	process.env.CORS_ORIGINS ?? "http://localhost:3000,http://localhost:3001,http://localhost:3002"
)
	.split(",")
	.map((o) => o.trim())
	.filter(Boolean)

app.use(
	cors({
		origin: (origin, callback) => {
			// Allowed frontend origins get full CORS (so XHR + credentials work).
			// Everything else (no Origin = curl/server-to-server, or "null" from a
			// payment-gateway redirect/navigation) is allowed through WITHOUT CORS
			// headers — never erroring. Cross-origin XHR from untrusted sites still
			// can't read responses (no Allow-Origin header), but top-level
			// navigations like the SSLCommerz success/fail/cancel POST are not blocked.
			if (!origin || allowedOrigins.includes(origin)) {
				return callback(null, true)
			}
			return callback(null, false)
		},
		credentials: true,
	})
)

// parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Vercel's serverless functions are not long-lived, so node-cron can't tick
// there. Locally (or on any persistent server) the in-process cron runs as
// before; on Vercel the same job is exposed below and triggered by Vercel
// Cron (see vercel.json "crons").
if (!process.env.VERCEL) {
	cron.schedule("* * * * *", () => {
		appointmentService.cancelAppointment()
	})
}

app.get(
	"/api/cron/cancel-unpaid-appointments",
	async (req: Request, res: Response) => {
		// Vercel Cron sends "Authorization: Bearer <CRON_SECRET>" automatically
		// when a CRON_SECRET env var is set on the project.
		if (
			process.env.CRON_SECRET &&
			req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`
		) {
			res.status(status.UNAUTHORIZED).json({
				success: false,
				message: "Unauthorized",
			})
			return
		}
		await appointmentService.cancelAppointment()
		res.json({ success: true, message: "Unpaid appointments cancelled" })
	}
)

app.get("/", (req: Request, res: Response) => {
	res.send({
		message: "Healthcare server running...",
	})
})

app.use("/api/v1", router)
app.use(globalErrorHandler)

app.use((req: Request, res: Response, next: NextFunction) => {
	res.status(status.NOT_FOUND).json({
		success: false,
		message: "API NOT FOUND!!!",
		error: {
			path: req.originalUrl,
			message: "Your requested API path not found!!! ",
		},
	})
})

export default app
