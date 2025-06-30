import { AppointmentStatus, PaymentStatus, Prescription } from "@prisma/client"
import prisma from "../../../shared/prisma"
import { IAuthUser } from "../../interfaces/common"
import ApiError from "../../errors/ApiErrors"
import status from "http-status"
import { IPagination } from "../../interfaces/pagination"
import { paginationHelpers } from "../../../helpers/paginationHelpers"

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

const patientPrescription = async (user: IAuthUser, options: IPagination) => {
	const { limit, page, skip } = paginationHelpers.calculatePagination(options)

	const result = await prisma.prescription.findMany({
		where: {
			patient: {
				email: user?.email,
			},
		},
		skip,
		take: limit,
		orderBy:
			options.sortBy && options.sortOrder
				? { [options.sortBy]: options.sortOrder }
				: { createdAt: "desc" },
		include: {
			doctor: true,
			appointment: true,
			patient: true,
		},
	})

	const total = await prisma.prescription.count({
		where: {
			patient: {
				email: user?.email,
			},
		},
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

export const prescriptionService = {
	createPrescription,
	patientPrescription,
}
