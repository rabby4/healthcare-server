import prisma from "../../../shared/prisma"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { jwtHelpers } from "../../../shared/jwtHelper"

const loginUser = async (payload: { email: string; password: string }) => {
	const userData = await prisma.user.findUniqueOrThrow({
		where: {
			email: payload.email,
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
		"abcdefg",
		"5m"
	)

	const refreshToken = jwtHelpers.generateToken(
		{
			email: userData.email,
			role: userData.role,
		},
		"abcdefghi",
		"30d"
	)

	return {
		accessToken,
		refreshToken,
		needPasswordChange: userData.needPasswordChange,
	}
}

export const authServices = {
	loginUser,
}
