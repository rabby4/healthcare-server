import { Prisma } from "@prisma/client"
import { paginationHelpers } from "../../../helpers/paginationHelpers"
import prisma from "../../../shared/prisma"
import { IAuthUser } from "../../interfaces/common"
import { IPagination } from "../../interfaces/pagination"

const createDoctorSchedule = async (
	user: any,
	payload: { scheduleIds: string[] }
) => {
	const doctorData = await prisma.doctor.findUniqueOrThrow({
		where: {
			email: user.email,
		},
	})

	const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
		doctorId: doctorData.id,
		scheduleId,
	}))

	const result = await prisma.doctorSchedule.createMany({
		data: doctorScheduleData,
	})
	return result
}

const getMySchedules = async (
	params: any,
	options: IPagination,
	user: IAuthUser
) => {
	const { startDate, endDate, ...filterData } = params
	const { page, limit, skip } = paginationHelpers.calculatePagination(options)
	const andCondition: Prisma.DoctorScheduleWhereInput[] = []

	if (startDate && endDate) {
		andCondition.push({
			AND: [
				{
					schedule: {
						startDateTime: {
							gte: startDate,
						},
					},
				},
				{
					schedule: {
						endDateTime: {
							lte: endDate,
						},
					},
				},
			],
		})
	}

	if (Object.keys(filterData).length > 0) {
		if (
			typeof filterData.isBooked === "string" &&
			filterData.isBooked === "true"
		) {
			filterData.isBooked = true
		} else if (
			typeof filterData.isBooked === "string" &&
			filterData.isBooked === "false"
		) {
			filterData.isBooked = false
		}
		andCondition.push({
			AND: Object.keys(filterData).map((key) => ({
				[key]: {
					equals: (filterData as any)[key],
				},
			})),
		})
	}

	const whereCondition: Prisma.DoctorScheduleWhereInput =
		andCondition.length > 0 ? { AND: andCondition } : {}

	const result = await prisma.doctorSchedule.findMany({
		where: whereCondition,
		skip,
		take: limit,
		orderBy:
			options.sortBy && options.sortOrder
				? {
						[options.sortBy]: options.sortOrder,
				  }
				: {},
	})

	const total: number = await prisma.doctorSchedule.count({
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

export const doctorScheduleService = {
	createDoctorSchedule,
	getMySchedules,
}
