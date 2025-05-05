import { Prisma, PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const getAllAdmin = async (params: any) => {
	const { searchTerm, ...filterData } = params
	const andCondition: Prisma.AdminWhereInput[] = []

	const searchFields = ["name", "email"]

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
	})
	return result
}

export const adminServices = {
	getAllAdmin,
}
