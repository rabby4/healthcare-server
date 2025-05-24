import { Patient, Prisma } from "@prisma/client"
import { IPagination } from "../../interfaces/pagination"
import { paginationHelpers } from "../../../helpers/paginationHelpers"
import prisma from "../../../shared/prisma"
import { IPatientFilterRequest } from "./patient.interface"
import { searchFields } from "./patient.constant"

const getAllPatient = async (
	params: IPatientFilterRequest,
	options: IPagination
) => {
	const { searchTerm, ...filterData } = params
	const { page, limit, skip } = paginationHelpers.calculatePagination(options)
	const andCondition: Prisma.PatientWhereInput[] = []

	if (searchTerm) {
		andCondition.push({
			OR: searchFields.map((field) => ({
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

	andCondition.push({
		isDeleted: false,
	})

	const whereCondition: Prisma.PatientWhereInput = { AND: andCondition }

	const result = await prisma.patient.findMany({
		where: whereCondition,
		skip,
		take: limit,
		orderBy:
			options.sortBy && options.sortOrder
				? {
						[options.sortBy]: options.sortOrder,
				  }
				: { createdAt: "desc" },
		include: {
			MedicalReport: true,
			patientHealthData: true,
		},
	})

	const total: number = await prisma.patient.count({
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

const getPatientById = async (id: string): Promise<Patient | null> => {
	const result = await prisma.patient.findUnique({
		where: {
			id,
			isDeleted: false,
		},
		include: {
			MedicalReport: true,
			patientHealthData: true,
		},
	})
	return result
}

export const patientService = {
	getAllPatient,
	getPatientById,
}
