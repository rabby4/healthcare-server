import { Request, Response } from "express"
import { adminServices } from "./admin.service"

const getAllAdmin = async (req: Request, res: Response) => {
	try {
		const result = await adminServices.getAllAdmin(req.query)
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
