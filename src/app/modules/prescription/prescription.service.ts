import { AppointmentStatus, PaymentStatus, Prescription } from "@prisma/client"
import prisma from "../../../shared/prisma"
import { IAuthUser } from "../../interfaces/common"
import ApiError from "../../errors/ApiErrors"
import status from "http-status"

const createPrescription = async (
	user: IAuthUser,
	payload: Partial<Prescription>
) => {
	const appointmentData = await prisma.appointment.findUniqueOrThrow({
		where: {
			id: payload.appointmentId,
			status: AppointmentStatus.COMPLETED,
			paymentStatus: PaymentStatus.PAID,
		},
		include: {
			doctor: true,
		},
	})

	if (user?.email !== appointmentData.doctor.email) {
		throw new ApiError(
			status.BAD_REQUEST,
			"You are not authorized to create a prescription for this appointment."
		)
	}

	const result = await prisma.prescription.create({
		data: {
			appointmentId: appointmentData.id,
			doctorId: appointmentData.doctorId,
			patientId: appointmentData.patientId,
			instructions: payload.instructions as string,
			followUpDate: payload.followUpDate || null || undefined,
		},
		include: {
			patient: true,
		},
	})

	return result
}

export const prescriptionService = {
	createPrescription,
}
