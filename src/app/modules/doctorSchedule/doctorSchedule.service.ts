import { Prisma } from "@prisma/client"
import { paginationHelpers } from "../../../helpers/paginationHelpers"
import prisma from "../../../shared/prisma"
import { IAuthUser } from "../../interfaces/common"
import { IPagination } from "../../interfaces/pagination"
import ApiError from "../../errors/ApiErrors"
import status from "http-status"
import { IDoctorScheduleFilterRequest } from "./doctorSchedule.interface"

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

const getAllDoctorSchedule = async (
	filters: IDoctorScheduleFilterRequest,
	options: IPagination
) => {
	const { limit, page, skip } = paginationHelpers.calculatePagination(options)
	const { searchTerm, ...filterData } = filters
	const andConditions = []

	if (searchTerm) {
		andConditions.push({
			doctor: {
				name: {
					contains: searchTerm,
					mode: "insensitive",
				},
			},
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
		andConditions.push({
			AND: Object.keys(filterData).map((key) => ({
				[key]: {
					equals: (filterData as any)[key],
				},
			})),
		})
	}

	const whereConditions: any =
		andConditions.length > 0 ? { AND: andConditions } : {}
	const result = await prisma.doctorSchedule.findMany({
		include: {
			doctor: true,
			schedule: true,
		},
		where: whereConditions,
		skip,
		take: limit,
		orderBy:
			options.sortBy && options.sortOrder
				? { [options.sortBy]: options.sortOrder }
				: {},
	})
	const total = await prisma.doctorSchedule.count({
		where: whereConditions,
	})

	return {
		meta: {
			total,
			page,
			limit,
		},
		data: result,
	}
}

const deleteSchedule = async (user: IAuthUser, id: string) => {
	const doctorData = await prisma.doctor.findUniqueOrThrow({
		where: {
			email: user?.email,
		},
	})

	const isBookedSchedule = await prisma.doctorSchedule.findFirst({
		where: {
			doctorId: doctorData.id,
			scheduleId: id,
			isBooked: true,
		},
	})

	if (isBookedSchedule) {
		throw new ApiError(
			status.BAD_REQUEST,
			"This schedule is already booked and cannot be deleted!"
		)
	}

	const result = await prisma.doctorSchedule.delete({
		where: {
			doctorId_scheduleId: {
				doctorId: doctorData.id,
				scheduleId: id,
			},
		},
	})
	return result
}

export const doctorScheduleService = {
	createDoctorSchedule,
	getMySchedules,
	getAllDoctorSchedule,
	deleteSchedule,
}
