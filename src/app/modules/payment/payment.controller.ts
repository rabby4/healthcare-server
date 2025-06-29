import status from "http-status"
import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { paymentService } from "./payment.service"

const initPayment = catchAsync(async (req, res) => {
	const { appointmentId } = req.params
	const result = await paymentService.initPayment(appointmentId)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Payment initiate successfully!",
		data: result,
	})
})

const validatePayment = catchAsync(async (req, res) => {
	const result = await paymentService.validatePayment(req.query)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Payment validation successfully!",
		data: result,
	})
})

export const paymentController = {
	initPayment,
	validatePayment,
}
