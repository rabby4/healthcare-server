import { UserRole } from "@prisma/client"
import * as bcrypt from "bcrypt"
import prisma from "../../../shared/prisma"
import { fileUploader } from "../../../helpers/fileUploader"

const createAdmin = async (req: any) => {
	const file = req.file
	if (file) {
		const uploadedFile = await fileUploader.uploadToCloudinary(file)
		req.body.admin.profilePhoto = uploadedFile?.secure_url
	}

	const hashPass = await bcrypt.hash(req.body.password, 12)

	const userData = {
		email: req.body.admin.email,
		password: hashPass,
		role: UserRole.ADMIN,
	}

	const result = await prisma.$transaction(async (transactionClient) => {
		await transactionClient.user.create({
			data: userData,
		})
		const createdAdminData = await transactionClient.admin.create({
			data: req.body.admin,
		})
		return createdAdminData
	})

	return result
}

export const userServices = {
	createAdmin,
}
