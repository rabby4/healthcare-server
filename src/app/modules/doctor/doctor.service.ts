import { Prisma } from "@prisma/client"
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

export const doctorServices = {
	getAllDoctors,
}
