import { Request, Response } from "express"
import { adminServices } from "./admin.service"
import pick from "../../../shared/pick"
import { adminFilterFields, paginationOptions } from "./admin.constant"

const getAllAdmin = async (req: Request, res: Response) => {
	const filters = pick(req.query, adminFilterFields)
	const options = pick(req.query, paginationOptions)

	try {
		const result = await adminServices.getAllAdmin(filters, options)
		res.status(200).json({
			success: true,
			message: "All admin fetched successfully!",
			meta: result.meta,
			data: result.data,
		})
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: error.name || "Something want wrong!",
			error,
		})
	}
}

const getAdminById = async (req: Request, res: Response) => {
	const { id } = req.params

	try {
		const result = await adminServices.getAdminById(id)
		res.status(200).json({
			success: true,
			message: "Admin data fetched by id!",
			data: result,
		})
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: error.name || "Something want wrong!",
			error,
		})
	}
}

const updateAdminById = async (req: Request, res: Response) => {
	const { id } = req.params
	const data = req.body
	try {
		const result = await adminServices.updateAdminById(id, data)
		res.status(200).json({
			success: true,
			message: "Admin data updated!",
			data: result,
		})
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: error.name || "Something want wrong!",
			error,
		})
	}
}

const deleteAdminById = async (req: Request, res: Response) => {
	const { id } = req.params
	try {
		const result = await adminServices.deleteAdminById(id)
		res.status(200).json({
			success: true,
			message: "Admin data deleted!",
			data: result,
		})
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: error.name || "Something want wrong!",
			error,
		})
	}
}

const softDeleteAdminById = async (req: Request, res: Response) => {
	const { id } = req.params
	try {
		const result = await adminServices.softDeleteAdminById(id)
		res.status(200).json({
			success: true,
			message: "Admin data deleted!",
			data: result,
		})
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: error.name || "Something want wrong!",
			error,
		})
	}
}

export const adminController = {
	getAllAdmin,
	getAdminById,
	updateAdminById,
	deleteAdminById,
	softDeleteAdminById,
}
