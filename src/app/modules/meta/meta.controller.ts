import status from "http-status"
import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { metaService } from "./meta.service"
import { Request, Response } from "express"
import { IAuthUser } from "../../interfaces/common"

const fetchDashboardMetaData = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const user = req.user
		const result = await metaService.fetchDashboardMetaData(user as IAuthUser)
		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "All doctors fetched successfully!",
			data: result,
		})
	}
)

export const metaController = {
	fetchDashboardMetaData,
}
