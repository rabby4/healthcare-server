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

	return await prisma.$transaction(async (tx) => {
		const result = await tx.review.create({
			data: {
				appointmentId: appointmentData.id,
				doctorId: appointmentData.doctorId,
				patientId: appointmentData.patientId,
				rating: payload.rating,
				comment: payload.comment,
			},
		})

		const avgRating = await tx.review.aggregate({
			_avg: {
				rating: true,
			},
		})
		await tx.doctor.update({
			where: {
				id: appointmentData.doctorId,
			},
			data: {
				averageRating: avgRating._avg.rating as number,
			},
		})

		return result
	})
}

export const reviewService = {
	createReview,
}
