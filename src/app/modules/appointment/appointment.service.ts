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
	const doctorScheduleData = await prisma.doctorSchedule.findFirstOrThrow({
		where: {
			doctorId: payload.doctorId,
			scheduleId: payload.scheduleId,
			isBooked: false,
		},
	})

	const videoCallingId = uuidv4()

	const result = await prisma.appointment.create({
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

	return result
}

export const appointmentService = {
	createAppointment,
}
