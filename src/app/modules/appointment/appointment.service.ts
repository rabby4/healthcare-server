import prisma from "../../../shared/prisma"
import { IAuthUser } from "../../interfaces/common"
import { v4 as uuidv4 } from "uuid"

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

export const appointmentService = {
	createAppointment,
}
