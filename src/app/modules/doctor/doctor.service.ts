import { Prisma, UserStatus } from "@prisma/client"
import { paginationHelpers } from "../../../helpers/paginationHelpers"
import prisma from "../../../shared/prisma"
import { searchFields } from "./doctor.constant"
import { IPagination } from "../../interfaces/pagination"
import { IDoctorFilterRequest } from "./doctor.interface"

const getAllDoctors = async (
	params: IDoctorFilterRequest,
	options: IPagination
) => {
	const { searchTerm, ...filterData } = params
	const { page, limit, skip } = paginationHelpers.calculatePagination(options)
	const andCondition: Prisma.DoctorWhereInput[] = []

	if (searchTerm) {
		andCondition.push({
			OR: searchFields.map((filed) => ({
				[filed]: {
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

	andCondition.push({
		isDeleted: false,
	})

	const whereCondition: Prisma.DoctorWhereInput = { AND: andCondition }

	const result = await prisma.doctor.findMany({
		where: whereCondition,
		skip,
		take: limit,
		orderBy:
			options.sortBy && options.sortOrder
				? { [options.sortBy]: options.sortOrder }
				: { createdAt: "desc" },
	})

	const total: number = await prisma.doctor.count({
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

const getDoctorById = async (id: string) => {
	const result = await prisma.doctor.findUnique({
		where: {
			id,
			isDeleted: false,
		},
	})
	return result
}

const deleteDoctorById = async (id: string) => {
	await prisma.doctor.findUniqueOrThrow({
		where: {
			id,
		},
	})

	const result = await prisma.$transaction(async (transactionClient) => {
		const deleteDoctor = await transactionClient.doctor.delete({
			where: {
				id,
			},
		})
		await transactionClient.user.delete({
			where: {
				email: deleteDoctor.email,
			},
		})
		return deleteDoctor
	})
	return result
}

const updateDoctorById = async (id: string, payload: any) => {
	const { specialties, ...doctorData } = payload

	const doctorInfo = await prisma.doctor.findUniqueOrThrow({
		where: {
			id,
		},
	})

	const result = await prisma.$transaction(async (transactionClient) => {
		const updateDoctorData = await transactionClient.doctor.update({
			where: {
				id,
			},
			data: doctorData,
			include: {
				DoctorSpecialties: true,
			},
		})

		for (const specialtiesId of specialties) {
			await transactionClient.doctorSpecialties.create({
				data: {
					doctorId: doctorInfo.id,
					specialtiesId,
				},
			})
		}
		return updateDoctorData
	})

	return result
}

const softDeleteDoctorById = async (id: string) => {
	await prisma.doctor.findUniqueOrThrow({
		where: {
			id,
		},
	})

	const result = await prisma.$transaction(async (transactionClient) => {
		const deleteDoctor = await transactionClient.doctor.update({
			where: {
				id,
			},
			data: {
				isDeleted: true,
			},
		})
		await transactionClient.user.update({
			where: {
				email: deleteDoctor.email,
			},
			data: {
				status: UserStatus.DELETED,
			},
		})
		return deleteDoctor
	})
	return result
}

export const doctorServices = {
	getAllDoctors,
	getDoctorById,
	updateDoctorById,
	deleteDoctorById,
	softDeleteDoctorById,
}
