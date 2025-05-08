import { Prisma, PrismaClient } from "@prisma/client"
import { searchFields } from "./admin.constant"

const prisma = new PrismaClient()

const getAllAdmin = async (params: any, options: any) => {
	const { searchTerm, ...filterData } = params
	const { page, limit } = options
	const andCondition: Prisma.AdminWhereInput[] = []

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
					equals: filterData[key],
				},
			})),
		})
	}
	const whereCondition: Prisma.AdminWhereInput = { AND: andCondition }

	const result = await prisma.admin.findMany({
		where: whereCondition,
		skip: (Number(page) - 1) * Number(limit),
		take: Number(limit),
	})
	return result
}

export const adminServices = {
	getAllAdmin,
}
