import status from "http-status"
import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { doctorScheduleService } from "./doctorSchedule.service"
import { Request } from "express"
import { IAuthUser } from "../../interfaces/common"

const createDoctorSchedule = catchAsync(
	async (req: Request & { user?: IAuthUser }, res) => {
		const user = req.user
		const result = await doctorScheduleService.createDoctorSchedule(
			user,
			req.body
		)
		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "Create Schedule successfully!",
			data: result,
		})
	}
)

export const doctorScheduleController = {
	createDoctorSchedule,
}
