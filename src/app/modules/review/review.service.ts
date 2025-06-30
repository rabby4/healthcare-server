import status from "http-status"
import prisma from "../../../shared/prisma"
import ApiError from "../../errors/ApiErrors"
import { IAuthUser } from "../../interfaces/common"

const createReview = async (user: IAuthUser, payload: any) => {
	const patientData = await prisma.patient.findUniqueOrThrow({
		where: {
			email: user?.email,
		},
	})
	const appointmentData = await prisma.appointment.findUniqueOrThrow({
		where: {
			id: payload.appointmentId,
		},
	})

	if (patientData.id !== appointmentData.patientId) {
		throw new ApiError(
			status.BAD_REQUEST,
			"You are not authorized to create a review for this appointment."
		)
	}

	const result = await prisma.review.create({
		data: {
			appointmentId: appointmentData.id,
			doctorId: appointmentData.doctorId,
			patientId: appointmentData.patientId,
			rating: payload.rating,
			comment: payload.comment,
		},
	})
	return result
}

export const reviewService = {
	createReview,
}
