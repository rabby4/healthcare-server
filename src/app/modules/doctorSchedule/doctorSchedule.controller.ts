import status from "http-status"
import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { doctorScheduleService } from "./doctorSchedule.service"
import { Request } from "express"
import { IAuthUser } from "../../interfaces/common"
import pick from "../../../shared/pick"

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

const getMySchedules = catchAsync(
	async (req: Request & { user?: IAuthUser }, res) => {
		const filters = pick(req.query, ["startDate", "endDate", "isBooked"])
		const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"])
		const user = req.user as IAuthUser

		const result = await doctorScheduleService.getMySchedules(
			filters,
			options,
			user
		)
		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "Fetch my schedule successfully!",
			data: result,
		})
	}
)

export const doctorScheduleController = {
	createDoctorSchedule,
	getMySchedules,
}
