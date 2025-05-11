import prisma from "../../../shared/prisma"
import bcrypt from "bcrypt"
import { jwtHelpers } from "../../../shared/jwtHelper"
import { UserStatus } from "@prisma/client"

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

const refreshToken = async (token: string) => {
	let decodedData

	try {
		decodedData = jwtHelpers.verifyToken(token, "abcdefghi")
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
		"abcdefg",
		"5m"
	)

	return {
		accessToken,
		needPasswordChange: userData.needPasswordChange,
	}
}

export const authServices = {
	loginUser,
	refreshToken,
}
