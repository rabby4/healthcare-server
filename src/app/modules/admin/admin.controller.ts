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
}
