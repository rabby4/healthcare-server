import { Patient, Prisma } from "@prisma/client"
import { IPagination } from "../../interfaces/pagination"
import { paginationHelpers } from "../../../helpers/paginationHelpers"
import prisma from "../../../shared/prisma"
import { IPatientFilterRequest, IPatientUpdate } from "./patient.interface"
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
			medicalReport: true,
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
			medicalReport: true,
			patientHealthData: true,
		},
	})
	return result
}

const updatePatient = async (
	id: string,
	payload: Partial<IPatientUpdate>
): Promise<Patient | null> => {
	const { patientHealthData, medicalReport, ...patientData } = payload

	const patientInfo = await prisma.patient.findUniqueOrThrow({
		where: {
			id,
		},
	})

	await prisma.$transaction(async (transactionClient) => {
		// update patient data
		await transactionClient.patient.update({
			where: {
				id,
			},
			data: patientData,
			include: {
				medicalReport: true,
				patientHealthData: true,
			},
		})

		// create or update patient health data
		if (patientHealthData) {
			await transactionClient.patientHealthData.upsert({
				where: {
					patientId: patientInfo.id,
				},
				update: patientHealthData,
				create: { ...patientHealthData, patientId: patientInfo.id },
			})
		}

		// create medical report
		if (medicalReport) {
			await transactionClient.medicalReport.create({
				data: { ...medicalReport, patientId: patientInfo.id },
			})
		}
	})

	const responseData = await prisma.patient.findUnique({
		where: {
			id,
			isDeleted: false,
		},
		include: {
			medicalReport: true,
			patientHealthData: true,
		},
	})

	return responseData
}

const deletePatient = async (id: string) => {
	const result = await prisma.$transaction(async (tx) => {
		//! delete medical report
		await tx.medicalReport.deleteMany({
			where: {
				patientId: id,
			},
		})

		//! delete patient health data
		await tx.patientHealthData.delete({
			where: {
				patientId: id,
			},
		})

		//! delete patient
		const deletedPatient = await tx.patient.delete({
			where: {
				id,
			},
		})

		//! delete user
		await tx.user.delete({
			where: {
				email: deletedPatient.email,
			},
		})
		return deletedPatient
	})

	return result
}

export const patientService = {
	getAllPatient,
	getPatientById,
	updatePatient,
	deletePatient,
}
