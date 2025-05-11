import status from "http-status"
import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { authServices } from "./auth.service"

const loginUser = catchAsync(async (req, res) => {
	const result = await authServices.loginUser(req.body)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Logged in successfully!",
		data: result,
	})
})

export const authController = {
	loginUser,
}
