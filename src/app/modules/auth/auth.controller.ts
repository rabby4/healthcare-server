import status from "http-status"
import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { authServices } from "./auth.service"
import { Request, Response } from "express"
import { IAuthUser } from "../../interfaces/common"

const loginUser = catchAsync(async (req, res) => {
	const result = await authServices.loginUser(req.body)

	const { refreshToken } = result

	// In production the frontend and backend live on different domains, so the
	// cookie must be SameSite=None + Secure or browsers will drop it. Locally
	// (http) Secure cookies don't work, so fall back to Lax.
	const isProd = process.env.NODE_ENV === "production"
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: isProd,
		sameSite: isProd ? "none" : "lax",
	})

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

		await authServices.changePassword(user, req.body)
		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "Password changed successfully!",
			data: {
				status: 200,
				message: "Password changed successfully!",
			},
		})
	}
)

const forgotPassword = catchAsync(async (req, res) => {
	const result = await authServices.forgotPassword(req.body)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Password reset link send!",
		data: {
			status: 200,
			message: "Check your email for reset link!",
		},
	})
})

const resetPassword = catchAsync(async (req, res) => {
	const token = req.headers.authorization || ""
	await authServices.resetPassword(token, req.body)

	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Password reset link send to your email!",
		data: {
			status: 200,
			message: "Password Reset Successfully",
		},
	})
})

export const authController = {
	loginUser,
	refreshToken,
	changePassword,
	forgotPassword,
	resetPassword,
}
