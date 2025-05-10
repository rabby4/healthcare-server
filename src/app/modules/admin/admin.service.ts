import { Admin, Prisma, UserStatus } from "@prisma/client"
import { searchFields } from "./admin.constant"
import { paginationHelpers } from "../../../helpers/paginationHelpers"
import prisma from "../../../shared/prisma"

const getAllAdmin = async (params: any, options: any) => {
	const { searchTerm, ...filterData } = params
	const { page, limit, skip } = paginationHelpers.calculatePagination(options)
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
		skip,
		take: limit,
		orderBy:
			options.sortBy && options.sortOrder
				? {
						[options.sortBy]: options.sortOrder,
				  }
				: { createdAt: "desc" },
	})

	const total = await prisma.admin.count({
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

const getAdminById = async (id: string) => {
	const result = await prisma.admin.findUnique({
		where: {
			id,
		},
	})
	return result
}

const updateAdminById = async (id: string, data: Partial<Admin>) => {
	await prisma.admin.findUniqueOrThrow({
		where: {
			id,
		},
	})

	const result = await prisma.admin.update({
		where: {
			id,
		},
		data,
	})
	return result
}

const deleteAdminById = async (id: string) => {
	await prisma.admin.findUniqueOrThrow({
		where: {
			id,
		},
	})
	const result = await prisma.$transaction(async (transactionClient) => {
		const deleteAdmin = await transactionClient.admin.delete({
			where: {
				id,
			},
		})
		const deleteUser = await transactionClient.user.delete({
			where: {
				email: deleteAdmin.email,
			},
		})
		return deleteAdmin
	})
	return result
}

const softDeleteAdminById = async (id: string) => {
	await prisma.admin.findUniqueOrThrow({
		where: {
			id,
		},
	})

	const result = await prisma.$transaction(async (transactionClient) => {
		const adminSoftDelete = await transactionClient.admin.update({
			where: {
				id,
			},
			data: {
				isDeleted: true,
			},
		})
		const userSoftDelete = await transactionClient.user.update({
			where: {
				email: adminSoftDelete.email,
			},
			data: {
				status: UserStatus.DELETED,
			},
		})
		return adminSoftDelete
	})
	return result
}

export const adminServices = {
	getAllAdmin,
	getAdminById,
	updateAdminById,
	deleteAdminById,
	softDeleteAdminById,
}
