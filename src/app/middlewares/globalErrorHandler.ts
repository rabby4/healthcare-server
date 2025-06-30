import { NextFunction, Request, Response } from "express"
import status from "http-status"
import { Prisma } from "@prisma/client"

const globalErrorHandler = (
	err: any,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	let statusCode = status.INTERNAL_SERVER_ERROR
	let success = false
	let message = err.message || "Something went wrong!!!"
	let error = err

	if (err instanceof Prisma.PrismaClientValidationError) {
		message = "Validation error!!!"
		error = err.message
	} else if (err instanceof Prisma.PrismaClientKnownRequestError) {
		if (err.code === "P2002") {
			message = "Duplicate field value entered!!!"
			error = err.meta
		}
	}

	res.status(statusCode).json({
		success,
		message,
		error,
	})
}

export default globalErrorHandler
