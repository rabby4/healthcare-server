import status from "http-status"
import { Request, Response } from "express"
import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { paymentService } from "./payment.service"
import config from "../../../config"

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

// SSLCommerz redirects the user's BROWSER (POST or GET) to these URLs after
// payment. They are public (no JWT — the gateway can't carry one). The success
// handler validates the transaction server->SSLCommerz (which works on
// localhost, unlike the IPN), marks it PAID, then bounces the browser to the
// frontend status page. We always end on a redirect so the user returns to the app.
const FRONTEND = config.frontendUrl

const paymentSuccess = async (req: Request, res: Response) => {
	const payload = { ...(req.query as any), ...((req.body as any) || {}) }
	try {
		await paymentService.validatePayment(payload)
		return res.redirect(`${FRONTEND}/payment?status=success`)
	} catch {
		// Payment could not be validated — treat as failed so the slot is freed.
		return res.redirect(`${FRONTEND}/payment?status=failed`)
	}
}

const paymentFail = async (_req: Request, res: Response) => {
	return res.redirect(`${FRONTEND}/payment?status=failed`)
}

const paymentCancel = async (_req: Request, res: Response) => {
	return res.redirect(`${FRONTEND}/payment?status=cancel`)
}

export const paymentController = {
	initPayment,
	validatePayment,
	paymentSuccess,
	paymentFail,
	paymentCancel,
}
