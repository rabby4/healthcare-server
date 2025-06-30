import { Request, Response } from "express"
import catchAsync from "../../../shared/catchAsync"
import { IAuthUser } from "../../interfaces/common"
import { reviewService } from "./review.service"
import sendResponse from "../../../shared/sendResponse"
import status from "http-status"

const createPrescription = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const user = req.user as IAuthUser
		const result = await reviewService.createReview(user as IAuthUser, req.body)
		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "Review created successfully!",
			data: result,
		})
	}
)

export const reviewController = {
	createPrescription,
}
