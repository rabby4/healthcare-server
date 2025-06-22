import status from "http-status"
import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { appointmentService } from "./appointment.service"
import { IAuthUser } from "../../interfaces/common"
import { Request } from "express"
import pick from "../../../shared/pick"

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

const getMyAppointments = catchAsync(
	async (req: Request & { user?: IAuthUser }, res) => {
		const user = req.user
		const filter = pick(req.query, ["status", "paymentStatus"])
		const options = pick(req.query, ["sortBy", "limit", "page", "sortOrder"])

		const result = await appointmentService.getMyAppointments(
			user as IAuthUser,
			filter,
			options
		)

		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "Appointments retrieved successfully!",
			data: result,
		})
	}
)

export const appointmentController = {
	createAppointment,
	getMyAppointments,
}
