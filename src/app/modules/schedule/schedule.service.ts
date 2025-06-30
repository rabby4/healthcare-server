import { addHours, addMinutes, format } from "date-fns"
import prisma from "../../../shared/prisma"
import { Prisma, Schedule } from "@prisma/client"
import { IFilterRequest, ISchedule } from "./schedule.interface"
import { paginationHelpers } from "../../../helpers/paginationHelpers"
import { IPagination } from "../../interfaces/pagination"
import { IAuthUser } from "../../interfaces/common"
import convertDateTimeToUTC from "../../../shared/convertDateTime"

const createSchedule = async (payload: ISchedule): Promise<Schedule[]> => {
	const { startDate, endDate, startTime, endTime } = payload
	const currentDate = new Date(startDate)
	const lastDate = new Date(endDate)

	const intervalTime = 30
	const schedule = []

	while (currentDate <= lastDate) {
		const startDateTime = new Date(
			addMinutes(
				addHours(
					`${format(currentDate, "yyyy-MM-dd")}`,
					Number(startTime.split(":")[0])
				),
				Number(startTime.split(":")[1])
			)
		)

		const endDateTime = new Date(
			addMinutes(
				addHours(
					`${format(currentDate, "yyyy-MM-dd")}`,
					Number(endTime.split(":")[0])
				),
				Number(endTime.split(":")[1])
			)
		)

		const st = await convertDateTimeToUTC(startDateTime)
		const et = await convertDateTimeToUTC(
			addMinutes(startDateTime, intervalTime)
		)

		while (startDateTime < endDateTime) {
			// const scheduleData = {
			// 	startDateTime: startDateTime,
			// 	endDateTime: addMinutes(startDateTime, intervalTime),
			// }
			const scheduleData = {
				startDateTime: st,
				endDateTime: et,
			}

			const existingSchedule = await prisma.schedule.findFirst({
				where: {
					startDateTime: scheduleData.startDateTime,
					endDateTime: scheduleData.endDateTime,
				},
			})

			if (!existingSchedule) {
				const result = await prisma.schedule.create({
					data: scheduleData,
				})
				schedule.push(result)
			}

			startDateTime.setMinutes(startDateTime.getMinutes() + intervalTime)
		}
		currentDate.setDate(currentDate.getDate() + 1)
	}
	return schedule
}

const getAllSchedules = async (
	params: IFilterRequest,
	options: IPagination,
	user: IAuthUser
) => {
	const { startDate, endDate, ...filterData } = params
	const { page, limit, skip } = paginationHelpers.calculatePagination(options)
	const andCondition: Prisma.ScheduleWhereInput[] = []

	if (startDate && endDate) {
		andCondition.push({
			AND: [
				{
					startDateTime: {
						gte: startDate,
					},
				},
				{
					endDateTime: {
						lte: endDate,
					},
				},
			],
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

	const whereCondition: Prisma.ScheduleWhereInput =
		andCondition.length > 0 ? { AND: andCondition } : {}

	const doctorSchedules = await prisma.doctorSchedule.findMany({
		where: {
			doctor: { email: user?.email },
		},
	})

	const doctorScheduleIds = doctorSchedules.map(
		(schedule) => schedule.scheduleId
	)

	const result = await prisma.schedule.findMany({
		where: { ...whereCondition, id: { notIn: doctorScheduleIds } },
		skip,
		take: limit,
		orderBy:
			options.sortBy && options.sortOrder
				? {
						[options.sortBy]: options.sortOrder,
				  }
				: { createdAt: "desc" },
	})

	const total: number = await prisma.schedule.count({
		where: { ...whereCondition, id: { notIn: doctorScheduleIds } },
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

const getScheduleById = async (id: string): Promise<Schedule | null> => {
	const result = await prisma.schedule.findUnique({
		where: {
			id,
		},
	})
	console.log(result?.startDateTime.getHours())
	return result
}

const deleteSchedule = async (id: string): Promise<Schedule> => {
	const result = await prisma.schedule.delete({
		where: {
			id,
		},
	})
	return result
}

export const scheduleService = {
	createSchedule,
	getAllSchedules,
	getScheduleById,
	deleteSchedule,
}
