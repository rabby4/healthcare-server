import { Prisma, PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const getAllAdmin = async (params: any) => {
	const andCondition: Prisma.AdminWhereInput[] = []

	const searchFields = ["name", "email"]

	if (params.searchTerm) {
		andCondition.push({
			OR: searchFields.map((field) => ({
				[field]: {
					contains: params.searchTerm,
					mode: "insensitive",
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
