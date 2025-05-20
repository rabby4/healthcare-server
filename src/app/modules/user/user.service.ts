import {
	Admin,
	Doctor,
	Patient,
	Prisma,
	UserRole,
	UserStatus,
} from "@prisma/client"
import * as bcrypt from "bcrypt"
import prisma from "../../../shared/prisma"
import { fileUploader } from "../../../helpers/fileUploader"
import { Request } from "express"
import { IFile } from "../../interfaces/file"
import { paginationHelpers } from "../../../helpers/paginationHelpers"
import { IPagination } from "../../interfaces/pagination"
import { userSearchableFields } from "./user.constant"
import { IAuthUser } from "../../interfaces/common"

const createAdmin = async (req: Request): Promise<Admin> => {
	const file = req.file as IFile
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

const createDoctor = async (req: Request): Promise<Doctor> => {
	const file = req.file as IFile

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

const createPatient = async (req: Request): Promise<Patient> => {
	const file = req.file as IFile

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

const getAllUsers = async (params: any, options: IPagination) => {
	const { searchTerm, ...filterData } = params
	const { page, limit, skip } = paginationHelpers.calculatePagination(options)
	const andCondition: Prisma.UserWhereInput[] = []

	if (searchTerm) {
		andCondition.push({
			OR: userSearchableFields.map((field) => ({
				[field]: {
					contains: searchTerm,
					mode: "insensitive",
				},
			})),
		})
	}

	if (Object.keys(filterData).length > 0) {
		andCondition.push({
			AND: Object.keys(filterData).map((key) => ({
				[key]: {
					equals: (filterData as any)[key],
				},
			})),
		})
	}

	const whereCondition: Prisma.UserWhereInput =
		andCondition.length > 0 ? { AND: andCondition } : {}

	const result = await prisma.user.findMany({
		where: whereCondition,
		skip,
		take: limit,
		orderBy:
			options.sortBy && options.sortOrder
				? {
						[options.sortBy]: options.sortOrder,
				  }
				: { createdAt: "desc" },
		select: {
			id: true,
			email: true,
			role: true,
			needPasswordChange: true,
			status: true,
			createdAt: true,
			updatedAt: true,
			Admin: true,
			Doctor: true,
			Patient: true,
		},
	})

	const total: number = await prisma.user.count({
		where: whereCondition,
	})

	return {
		meta: {
			page,
			limit,
			total,
		},
		data: result,
	}
}

const changeProfileStatus = async (id: string, status: UserRole) => {
	await prisma.user.findUniqueOrThrow({
		where: {
			id,
		},
	})

	const updateStatus = await prisma.user.update({
		where: {
			id,
		},
		data: status,
	})
	return updateStatus
}

const getMyProfile = async (user: IAuthUser) => {
	const userInfo = await prisma.user.findUniqueOrThrow({
		where: {
			email: user?.email,
			status: UserStatus.ACTIVE,
		},
		select: {
			id: true,
			email: true,
			role: true,
			needPasswordChange: true,
			status: true,
		},
	})

	let profileInfo

	if (
		userInfo.role === UserRole.SUPER_ADMIN ||
		userInfo.role === UserRole.ADMIN
	) {
		profileInfo = await prisma.admin.findUnique({
			where: {
				email: userInfo.email,
			},
		})
	} else if (userInfo.role === UserRole.DOCTOR) {
		profileInfo = await prisma.doctor.findUnique({
			where: {
				email: userInfo.email,
			},
		})
	} else if (userInfo.role === UserRole.PATIENT) {
		profileInfo = await prisma.patient.findUnique({
			where: {
				email: userInfo.email,
			},
		})
	}

	return { ...userInfo, ...profileInfo }
}

const updateMyProfile = async (user: IAuthUser, req: Request) => {
	const userInfo = await prisma.user.findUniqueOrThrow({
		where: {
			email: user?.email,
			status: UserStatus.ACTIVE,
		},
	})

	const file = req.file as IFile
	if (file) {
		const uploadedFile = await fileUploader.uploadToCloudinary(file)
		req.body.profilePhoto = uploadedFile?.secure_url
	}

	let profileInfo

	if (
		userInfo.role === UserRole.SUPER_ADMIN ||
		userInfo.role === UserRole.ADMIN
	) {
		profileInfo = await prisma.admin.update({
			where: {
				email: userInfo.email,
			},
			data: req.body,
		})
	} else if (userInfo.role === UserRole.DOCTOR) {
		profileInfo = await prisma.doctor.update({
			where: {
				email: userInfo.email,
			},
			data: req.body,
		})
	} else if (userInfo.role === UserRole.PATIENT) {
		profileInfo = await prisma.patient.update({
			where: {
				email: userInfo.email,
			},
			data: req.body,
		})
	}

	return { ...profileInfo }
}

export const userServices = {
	createAdmin,
	createDoctor,
	createPatient,
	getAllUsers,
	changeProfileStatus,
	getMyProfile,
	updateMyProfile,
}
