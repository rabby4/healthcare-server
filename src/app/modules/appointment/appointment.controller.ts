import status from "http-status"
import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { appointmentService } from "./appointment.service"
import { IAuthUser } from "../../interfaces/common"
import { Request } from "express"

const createAppointment = catchAsync(
	async (req: Request & { user?: IAuthUser }, res) => {
		const user = req.user

		const result = await appointmentService.createAppointment(
			user as IAuthUser,
			req.body
		)

		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "Appointment created successfully!",
			data: result,
		})
	}
)

export const appointmentController = {
	createAppointment,
}
