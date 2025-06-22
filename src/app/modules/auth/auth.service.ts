import prisma from "../../../shared/prisma"
import bcrypt from "bcrypt"
import { jwtHelpers } from "../../../shared/jwtHelper"
import { UserStatus } from "@prisma/client"
import config from "../../../config"
import { Secret } from "jsonwebtoken"
import ApiError from "../../errors/ApiErrors"
import status from "http-status"
import emailSender from "./emailSender"

const loginUser = async (payload: { email: string; password: string }) => {
	const userData = await prisma.user.findUniqueOrThrow({
		where: {
			email: payload.email,
			status: UserStatus.ACTIVE,
		},
	})

	const isCorrectPassword: boolean = await bcrypt.compare(
		payload.password,
		userData.password
	)

	if (!isCorrectPassword) throw new Error("Incorrect Password!")

	const accessToken = jwtHelpers.generateToken(
		{
			email: userData.email,
			role: userData.role,
		},
		config.jwt.accessToken as Secret,
		config.jwt.accessTokenExpireIn as string
	)

	const refreshToken = jwtHelpers.generateToken(
		{
			email: userData.email,
			role: userData.role,
		},
		config.jwt.refreshToken as Secret,
		config.jwt.refreshTokenExpireIn as string
	)

	return {
		accessToken,
		refreshToken,
		needPasswordChange: userData.needPasswordChange,
	}
}

const refreshToken = async (token: string) => {
	let decodedData

	try {
		decodedData = jwtHelpers.verifyToken(
			token,
			config.jwt.refreshToken as Secret
		)
	} catch (error) {
		throw new Error("You are not authorized!")
	}

	const userData = await prisma.user.findUniqueOrThrow({
		where: {
			email: decodedData.email,
			status: UserStatus.ACTIVE,
		},
	})

	const accessToken = jwtHelpers.generateToken(
		{
			email: userData.email,
			role: userData.role,
		},
		config.jwt.accessToken as Secret,
		config.jwt.accessTokenExpireIn as string
	)

	return {
		accessToken,
		needPasswordChange: userData.needPasswordChange,
	}
}
const changePassword = async (user: any, payload: any) => {
	const existUser = await prisma.user.findUniqueOrThrow({
		where: {
			email: user.email,
			status: UserStatus.ACTIVE,
		},
	})

	const isCorrectPassword = await bcrypt.compare(
		payload.oldPassword,
		existUser.password
	)
	if (!isCorrectPassword)
		throw new ApiError(status.UNAUTHORIZED, "Password not match!!!")

	const hashedPassword = await bcrypt.hash(payload.newPassword, 12)

	await prisma.user.update({
		where: {
			email: user.email,
		},
		data: {
			password: hashedPassword,
			needPasswordChange: false,
		},
	})

	return {
		message: "Password changed successfully!!!",
	}
}

const forgotPassword = async (payload: { email: string }) => {
	const userData = await prisma.user.findUniqueOrThrow({
		where: {
			email: payload.email,
			status: UserStatus.ACTIVE,
		},
	})

	const resetPassToken = jwtHelpers.generateToken(
		{ email: userData.email, role: userData.role },
		config.jwt.resetPassToken as Secret,
		config.jwt.resetPassExpireIn as string
	)
	const resetPassLink =
		config.resetPassURL + `?userId=${userData.id}&token=${resetPassToken}`

	await emailSender(
		userData.email,
		`
			<div>
				<p>Dear user,</p>
				<p>your reset password request approved. Please reset your password to client below button.</p>
				<a href=${resetPassLink}>
					<button>Reset Password</button>
				</a>

			</div>
		`
	)
}

const resetPassword = async (
	token: string,
	payload: { id: string; password: string }
) => {
	await prisma.user.findUniqueOrThrow({
		where: {
			id: payload.id,
			status: UserStatus.ACTIVE,
		},
	})
	const isValidToken = jwtHelpers.verifyToken(
		token,
		config.jwt.resetPassToken as Secret
	)

	if (!isValidToken) throw new ApiError(status.FORBIDDEN, "Forbidden access")

	const hashedPassword = await bcrypt.hash(payload.password, 12)

	const updatePassword = await prisma.user.update({
		where: {
			id: payload.id,
			status: UserStatus.ACTIVE,
		},
		data: {
			password: hashedPassword,
		},
	})
	return updatePassword
}

export const authServices = {
	loginUser,
	refreshToken,
	changePassword,
	forgotPassword,
	resetPassword,
}
