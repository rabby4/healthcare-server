import { Request, Response } from "express"
import { adminServices } from "./admin.service"
import pick from "../../../shared/pick"

const getAllAdmin = async (req: Request, res: Response) => {
	const filters = pick(req.query, [
		"name",
		"email",
		"searchTerm",
		"contactNumber",
	])
	try {
		const result = await adminServices.getAllAdmin(filters)
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
