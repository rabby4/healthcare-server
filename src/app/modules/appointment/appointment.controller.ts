import status from "http-status"
import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { appointmentService } from "./appointment.service"
import { IAuthUser } from "../../interfaces/common"
import { Request, Response } from "express"
import pick from "../../../shared/pick"
import { appointmentFilterableFields } from "./appointment.constant"

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
	async (req: Request & { user?: IAuthUser }, res: Response) => {
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

const getAllAppointments = catchAsync(async (req: Request, res: Response) => {
	const filters = pick(req.query, appointmentFilterableFields)
	const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"])
	const result = await appointmentService.getAllAppointments(filters, options)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Appointment retrieval successfully",
		meta: result.meta,
		data: result.data,
	})
})

const changeAppointmentStatus = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const { id } = req.params
		const { appointmentStatus } = req.body
		const user = req.user as IAuthUser
		const result = await appointmentService.changeAppointmentStatus(
			id,
			appointmentStatus,
			user as IAuthUser
		)
		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "Appointment status changed successfully",
			data: result,
		})
	}
)

export const appointmentController = {
	createAppointment,
	getMyAppointments,
	getAllAppointments,
	changeAppointmentStatus,
}
