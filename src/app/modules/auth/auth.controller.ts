import status from "http-status"
import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { authServices } from "./auth.service"
import { Request, Response } from "express"
import { IAuthUser } from "../../interfaces/common"

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
		message: "Refresh token generate successfully!",
		data: result,
	})
})

const changePassword = catchAsync(
	async (req: Request & { user?: IAuthUser }, res: Response) => {
		const user = req.user

		const result = await authServices.changePassword(user, req.body)
		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "Password changed successfully!",
			data: result,
		})
	}
)

const forgotPassword = catchAsync(async (req, res) => {
	const result = await authServices.forgotPassword(req.body)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Password reset link send!",
		data: result,
	})
})

const resetPassword = catchAsync(async (req, res) => {
	const token = req.headers.authorization || ""
	await authServices.resetPassword(token, req.body)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Password reset link send!",
		data: null,
	})
})

export const authController = {
	loginUser,
	refreshToken,
	changePassword,
	forgotPassword,
	resetPassword,
}
