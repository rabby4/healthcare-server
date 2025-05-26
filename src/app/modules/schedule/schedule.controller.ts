import status from "http-status"
import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { scheduleService } from "./schedule.service"

const createSchedule = catchAsync(async (req, res) => {
	const result = await scheduleService.createSchedule(req.body)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Create Schedule successfully!",
		data: result,
	})
})

export const scheduleController = {
	createSchedule,
}
