import { NextFunction, Request, Response } from "express"
import status from "http-status"
import { Prisma } from "@prisma/client"
import { ZodError } from "zod"
import ApiError from "../errors/ApiErrors"

const globalErrorHandler = (
	err: any,
	req: Request,
	res: Response,
	next: NextFunction
) => {
	let statusCode: number = status.INTERNAL_SERVER_ERROR
	let message = err.message || "Something went wrong!!!"
	let error: any = err

	if (err instanceof ZodError) {
		statusCode = status.BAD_REQUEST
		message = "Validation error!!!"
		error = err.issues.map((issue) => ({
			field: issue.path[issue.path.length - 1],
			message: issue.message,
		}))
	} else if (err instanceof ApiError) {
		statusCode = err.statusCode
		message = err.message
		error = err.message
	} else if (err instanceof Prisma.PrismaClientValidationError) {
		statusCode = status.BAD_REQUEST
		message = "Validation error!!!"
		error = err.message
	} else if (err instanceof Prisma.PrismaClientKnownRequestError) {
		if (err.code === "P2002") {
			statusCode = status.CONFLICT
			message = "Duplicate field value entered!!!"
			error = err.meta
		} else if (err.code === "P2025") {
			statusCode = status.NOT_FOUND
			message = "Record not found!!!"
			error = err.meta
		}
	}

	res.status(statusCode).json({
		success: false,
		message,
		error,
	})
}

export default globalErrorHandler
