import status from "http-status"
import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { prescriptionService } from "./prescription.service"
import { Request, Response } from "express"
import { IAuthUser } from "../../interfaces/common"
import pick from "../../../shared/pick"

const createPrescription = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const user = req.user as IAuthUser
		const result = await prescriptionService.createPrescription(
			user as IAuthUser,
			req.body
		)
		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "Prescription created successfully!",
			data: result,
		})
	}
)

const patientPrescription = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const user = req.user as IAuthUser
		const options = pick(req.query, ["sortBy", "limit", "page", "sortOrder"])
		const result = await prescriptionService.patientPrescription(
			user as IAuthUser,
			options
		)
		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "Prescription retrieve successfully!",
			meta: result.meta,
			data: result.data,
		})
	}
)

export const prescriptionController = {
	createPrescription,
	patientPrescription,
}
