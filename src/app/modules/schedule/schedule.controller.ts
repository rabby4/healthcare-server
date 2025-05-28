import status from "http-status"
import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { scheduleService } from "./schedule.service"
import pick from "../../../shared/pick"
import { Request, Response } from "express"
import { IAuthUser } from "../../interfaces/common"

const createSchedule = catchAsync(async (req, res) => {
	const result = await scheduleService.createSchedule(req.body)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Create Schedule successfully!",
		data: result,
	})
})

const getAllSchedules = catchAsync(
	async (req: Request & { user?: IAuthUser }, res) => {
		const filters = pick(req.query, ["startDate", "endDate"])
		const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"])
		const user = req.user as IAuthUser

		const result = await scheduleService.getAllSchedules(filters, options, user)
		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "Fetch all schedule successfully!",
			data: result,
		})
	}
)

const getScheduleById = catchAsync(async (req: Request, res: Response) => {
	const { id } = req.params
	const result = await scheduleService.getScheduleById(id)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Schedule retrieval successfully",
		data: result,
	})
})

export const scheduleController = {
	createSchedule,
	getAllSchedules,
	getScheduleById,
}
