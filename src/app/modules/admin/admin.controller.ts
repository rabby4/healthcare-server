import { Request, Response } from "express"
import { adminServices } from "./admin.service"

const getAllAdmin = async (req: Request, res: Response) => {
	const result = await adminServices.getAllAdmin()
	res.status(200).json({
		success: true,
		message: "All admin fetched successfully!",
		data: result,
	})
}

export const adminController = {
	getAllAdmin,
}
