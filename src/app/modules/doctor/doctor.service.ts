import { Prisma, UserStatus } from "@prisma/client"
import { paginationHelpers } from "../../../helpers/paginationHelpers"
import prisma from "../../../shared/prisma"
import { searchFields } from "./doctor.constant"
import { IPagination } from "../../interfaces/pagination"
import { IDoctorFilterRequest } from "./doctor.interface"

const getAllDoctors = async (
	filters: IDoctorFilterRequest,
	options: IPagination
) => {
	const { searchTerm, specialties, ...filterData } = filters
	console.log(specialties)
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

	if (specialties && specialties.length > 0) {
		andCondition.push({
			DoctorSpecialties: {
				some: {
					specialties: {
						title: {
							contains: specialties,
							mode: "insensitive",
						},
					},
				},
			},
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
				: { averageRating: "desc" },
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

	await prisma.$transaction(async (transactionClient) => {
		const updateDoctorData = await transactionClient.doctor.update({
			where: {
				id,
			},
			data: doctorData,
			include: {
				DoctorSpecialties: true,
			},
		})

		if (specialties && specialties.length > 0) {
			//! delete specialties
			const deleteSpecialtyIds = specialties.filter(
				(specialty: any) => specialty.isDeleted
			)
			for (const specialty of deleteSpecialtyIds) {
				await transactionClient.doctorSpecialties.deleteMany({
					where: {
						doctorId: doctorInfo.id,
						specialtiesId: specialty.specialtiesId,
					},
				})
			}

			//* create specialties
			const createSpecialtyIds = specialties.filter(
				(specialty: any) => !specialty.isDeleted
			)

			for (const specialty of createSpecialtyIds) {
				await transactionClient.doctorSpecialties.create({
					data: {
						doctorId: doctorInfo.id,
						specialtiesId: specialty.specialtiesId,
					},
				})
			}
		}
	})
	const result = await prisma.doctor.findUnique({
		where: {
			id: doctorInfo.id,
		},
		include: {
			DoctorSpecialties: {
				include: {
					specialties: true,
				},
			},
		},
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
