import { NextFunction, Request, Response } from "express"
import { adminServices } from "./admin.service"
import pick from "../../../shared/pick"
import { adminFilterFields, paginationOptions } from "./admin.constant"
import sendResponse from "../../../shared/sendResponse"
import status from "http-status"

const getAllAdmin = async (req: Request, res: Response, next: NextFunction) => {
	const filters = pick(req.query, adminFilterFields)
	const options = pick(req.query, paginationOptions)

	try {
		const result = await adminServices.getAllAdmin(filters, options)
		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "All admin fetched successfully!",
			meta: result.meta,
			data: result.data,
		})
	} catch (error: any) {
		next(error)
	}
}

const getAdminById = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { id } = req.params

	try {
		const result = await adminServices.getAdminById(id)
		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "Admin data fetched by id!",
			data: result,
		})
	} catch (error: any) {
		next(error)
	}
}

const updateAdminById = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { id } = req.params
	const data = req.body
	try {
		const result = await adminServices.updateAdminById(id, data)
		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "Admin data updated!",
			data: result,
		})
	} catch (error: any) {
		next(error)
	}
}

const deleteAdminById = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { id } = req.params
	try {
		const result = await adminServices.deleteAdminById(id)
		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "Admin data deleted!",
			data: result,
		})
	} catch (error: any) {
		next(error)
	}
}

const softDeleteAdminById = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const { id } = req.params
	try {
		const result = await adminServices.softDeleteAdminById(id)
		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "Admin data deleted!",
			data: result,
		})
	} catch (error: any) {
		next(error)
	}
}

export const adminController = {
	getAllAdmin,
	getAdminById,
	updateAdminById,
	deleteAdminById,
	softDeleteAdminById,
}
