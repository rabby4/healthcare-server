import status from "http-status"
import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { doctorScheduleService } from "./doctorSchedule.service"
import { Request, Response } from "express"
import { IAuthUser } from "../../interfaces/common"
import pick from "../../../shared/pick"
import { scheduleFilterableFields } from "./doctorSchedule.constant"

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

const getAllDoctorSchedule = catchAsync(async (req: Request, res: Response) => {
	const filters = pick(req.query, scheduleFilterableFields)
	const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"])
	const result = await doctorScheduleService.getAllDoctorSchedule(
		filters,
		options
	)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Doctor Schedule retrieval successfully",
		meta: result.meta,
		data: result.data,
	})
})

const deleteSchedule = catchAsync(
	async (req: Request & { user?: IAuthUser }, res) => {
		const user = req.user as IAuthUser
		const { id } = req.params

		const result = await doctorScheduleService.deleteSchedule(user, id)
		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "Schedule deleted successfully!",
			data: result,
		})
	}
)

export const doctorScheduleController = {
	createDoctorSchedule,
	getMySchedules,
	getAllDoctorSchedule,
	deleteSchedule,
}
