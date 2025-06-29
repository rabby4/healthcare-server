import prisma from "../../../shared/prisma"
import { IAuthUser } from "../../interfaces/common"
import { v4 as uuidv4 } from "uuid"
import { IPagination } from "../../interfaces/pagination"
import { paginationHelpers } from "../../../helpers/paginationHelpers"
import {
	AppointmentStatus,
	PaymentStatus,
	Prisma,
	UserRole,
} from "@prisma/client"
import ApiError from "../../errors/ApiErrors"
import status from "http-status"

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

const getAllAppointments = async (filters: any, options: IPagination) => {
	const { limit, page, skip } = paginationHelpers.calculatePagination(options)
	const { patientEmail, doctorEmail, ...filterData } = filters
	const andConditions = []

	if (patientEmail) {
		andConditions.push({
			patient: {
				email: patientEmail,
			},
		})
	} else if (doctorEmail) {
		andConditions.push({
			doctor: {
				email: doctorEmail,
			},
		})
	}

	if (Object.keys(filterData).length > 0) {
		andConditions.push({
			AND: Object.keys(filterData).map((key) => {
				return {
					[key]: {
						equals: (filterData as any)[key],
					},
				}
			}),
		})
	}

	// console.dir(andConditions, { depth: Infinity })
	const whereConditions: Prisma.AppointmentWhereInput =
		andConditions.length > 0 ? { AND: andConditions } : {}

	const result = await prisma.appointment.findMany({
		where: whereConditions,
		skip,
		take: limit,
		orderBy:
			options.sortBy && options.sortOrder
				? { [options.sortBy]: options.sortOrder }
				: {
						createdAt: "desc",
				  },
		include: {
			doctor: true,
			patient: true,
		},
	})
	const total = await prisma.appointment.count({
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

const changeAppointmentStatus = async (
	appointmentId: string,
	appointmentStatus: AppointmentStatus,
	user: IAuthUser
) => {
	const appointmentData = await prisma.appointment.findUniqueOrThrow({
		where: {
			id: appointmentId,
		},
		include: {
			doctor: true,
		},
	})

	if (user?.role === UserRole.DOCTOR) {
		if (appointmentData.doctor.email !== user.email) {
			throw new ApiError(
				status.BAD_REQUEST,
				"You are not authorized to change this appointment status"
			)
		}
	}

	const updateAppointmentStatus = await prisma.appointment.update({
		where: {
			id: appointmentId,
		},
		data: {
			status: appointmentStatus,
		},
	})

	return updateAppointmentStatus
}

const cancelAppointment = async () => {
	const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000)

	const unPaidAppointments = await prisma.appointment.findMany({
		where: {
			createdAt: {
				lte: thirtyMinAgo,
			},
			paymentStatus: PaymentStatus.UNPAID,
		},
	})

	const appointmentIdsToCancel = unPaidAppointments.map(
		(appointment) => appointment.id
	)
	await prisma.$transaction(async (tx) => {
		await tx.payment.deleteMany({
			where: {
				appointmentId: {
					in: appointmentIdsToCancel,
				},
			},
		})

		await tx.appointment.deleteMany({
			where: {
				id: {
					in: appointmentIdsToCancel,
				},
			},
		})

		for (const unPaidAppointment of unPaidAppointments) {
			await tx.doctorSchedule.updateMany({
				where: {
					doctorId: unPaidAppointment.doctorId,
					scheduleId: unPaidAppointment.scheduleId,
				},
				data: {
					isBooked: false,
					appointmentId: null,
				},
			})
		}
	})
	console.log("updated")
}

export const appointmentService = {
	createAppointment,
	getMyAppointments,
	getAllAppointments,
	changeAppointmentStatus,
	cancelAppointment,
}
