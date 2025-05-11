import status from "http-status"
import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { authServices } from "./auth.service"

const loginUser = catchAsync(async (req, res) => {
	const result = await authServices.loginUser(req.body)

	const { refreshToken } = result

	res.cookie("refreshToken", refreshToken, { secure: false, httpOnly: true })

	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Logged in successfully!",
		data: {
			accessToken: result.accessToken,
			needPasswordChange: result.needPasswordChange,
		},
	})
})

const refreshToken = catchAsync(async (req, res) => {
	const { refreshToken } = req.cookies
	const result = await authServices.refreshToken(refreshToken)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Logged in successfully!",
		data: result,
	})
})

export const authController = {
	loginUser,
	refreshToken,
}
