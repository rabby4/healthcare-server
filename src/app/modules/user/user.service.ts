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

const createDoctor = async (req: any) => {
	const file = req.file
	if (file) {
		const uploadedFile = await fileUploader.uploadToCloudinary(file)
		req.body.doctor.profilePhoto = uploadedFile?.secure_url
	}

	const hashPass = await bcrypt.hash(req.body.password, 12)

	const userData = {
		email: req.body.doctor.email,
		password: hashPass,
		role: UserRole.DOCTOR,
	}

	const result = await prisma.$transaction(async (transactionClient) => {
		await transactionClient.user.create({
			data: userData,
		})
		const createdDoctorData = await transactionClient.doctor.create({
			data: req.body.doctor,
		})
		return createdDoctorData
	})

	return result
}

const createPatient = async (req: any) => {
	const file = req.file
	if (file) {
		const uploadedFile = await fileUploader.uploadToCloudinary(file)
		req.body.patient.profilePhoto = uploadedFile?.secure_url
	}

	const hashPass = await bcrypt.hash(req.body.password, 12)

	const userData = {
		email: req.body.patient.email,
		password: hashPass,
		role: UserRole.PATIENT,
	}

	const result = await prisma.$transaction(async (transactionClient) => {
		await transactionClient.user.create({
			data: userData,
		})
		const createdPatientData = await transactionClient.patient.create({
			data: req.body.patient,
		})
		return createdPatientData
	})

	return result
}

export const userServices = {
	createAdmin,
	createDoctor,
	createPatient,
}
