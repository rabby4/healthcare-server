import express, { Application, NextFunction, Request, Response } from "express"
import cors from "cors"
import router from "./app/router"
import globalErrorHandler from "./app/middlewares/globalErrorHandler"
import status from "http-status"

const app: Application = express()

app.use(cors())

// parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

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
