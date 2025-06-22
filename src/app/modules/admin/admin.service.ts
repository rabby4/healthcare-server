import { Admin, Prisma, UserStatus } from "@prisma/client"
import { searchFields } from "./admin.constant"
import { paginationHelpers } from "../../../helpers/paginationHelpers"
import prisma from "../../../shared/prisma"
import { IAdminFilterRequest } from "./admin.interface"
import { IPagination } from "../../interfaces/pagination"

const getAllAdmin = async (
	params: IAdminFilterRequest,
	options: IPagination
) => {
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
					equals: (filterData as any)[key],
				},
			})),
		})
	}

	andCondition.push({
		isDeleted: false,
	})

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

	const total: number = await prisma.admin.count({
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

const getAdminById = async (id: string): Promise<Admin | null> => {
	const result = await prisma.admin.findUnique({
		where: {
			id,
			isDeleted: false,
		},
	})
	return result
}

const updateAdminById = async (
	id: string,
	data: Partial<Admin>
): Promise<Admin> => {
	await prisma.admin.findUniqueOrThrow({
		where: {
			id,
			isDeleted: false,
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

const deleteAdminById = async (id: string): Promise<Admin | null> => {
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
		await transactionClient.user.delete({
			where: {
				email: deleteAdmin.email,
			},
		})
		return deleteAdmin
	})
	return result
}

const softDeleteAdminById = async (id: string): Promise<Admin | null> => {
	await prisma.admin.findUniqueOrThrow({
		where: {
			id,
			isDeleted: false,
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
		await transactionClient.user.update({
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
