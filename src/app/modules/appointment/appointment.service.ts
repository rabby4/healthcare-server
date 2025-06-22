import prisma from "../../../shared/prisma"
import { IAuthUser } from "../../interfaces/common"
import { v4 as uuidv4 } from "uuid"
import { IPagination } from "../../interfaces/pagination"
import { paginationHelpers } from "../../../helpers/paginationHelpers"
import { Prisma, UserRole } from "@prisma/client"

const createAppointment = async (user: IAuthUser, payload: any) => {
	const patientData = await prisma.patient.findUniqueOrThrow({
		where: {
			email: user?.email,
		},
	})
	const doctorData = await prisma.doctor.findUniqueOrThrow({
		where: {
			id: payload.doctorId,
		},
	})
	await prisma.doctorSchedule.findFirstOrThrow({
		where: {
			doctorId: payload.doctorId,
			scheduleId: payload.scheduleId,
			isBooked: false,
		},
	})

	const videoCallingId = uuidv4()

	const result = await prisma.$transaction(async (tx) => {
		const appointmentData = await prisma.appointment.create({
			data: {
				patientId: patientData.id,
				doctorId: doctorData.id,
				scheduleId: payload.scheduleId,
				videoCallingId,
			},
			include: {
				patient: true,
				doctor: true,
				schedule: true,
			},
		})
		await tx.doctorSchedule.update({
			where: {
				doctorId_scheduleId: {
					doctorId: doctorData.id,
					scheduleId: payload.scheduleId,
				},
			},
			data: {
				isBooked: true,
				appointmentId: appointmentData.id,
			},
		})

		const today = new Date()
		const transactionId = `txID-${today.getFullYear()}-${today.getMonth()}-${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}`
		console.log(transactionId)

		await tx.payment.create({
			data: {
				appointmentId: appointmentData.id,
				amount: doctorData.appointmentFee,
				transactionId,
			},
		})
		return appointmentData
	})

	return result
}

const getMyAppointments = async (
	user: IAuthUser,
	filter: any,
	options: IPagination
) => {
	const { limit, page, skip } = paginationHelpers.calculatePagination(options)
	const { ...filterData } = filter

	const andCondition: Prisma.AppointmentWhereInput[] = []

	if (user?.role === UserRole.PATIENT) {
		andCondition.push({
			patient: {
				email: user.email,
			},
		})
	} else if (user?.role === UserRole.DOCTOR) {
		andCondition.push({
			doctor: {
				email: user.email,
			},
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

	const whereCondition: Prisma.AppointmentWhereInput = { AND: andCondition }

	const result = await prisma.appointment.findMany({
		where: whereCondition,
		skip,
		take: limit,
		orderBy:
			options.sortBy && options.sortOrder
				? { [options.sortBy]: options.sortOrder }
				: { createdAt: "desc" },
		include:
			user?.role === UserRole.PATIENT
				? { doctor: true, schedule: true }
				: {
						patient: {
							include: {
								medicalReport: true,
								patientHealthData: true,
							},
						},
						schedule: true,
				  },
	})

	const total: number = await prisma.appointment.count({
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

export const appointmentService = {
	createAppointment,
	getMyAppointments,
}
