import { PaymentStatus, UserRole } from "@prisma/client"
import { IAuthUser } from "../../interfaces/common"
import prisma from "../../../shared/prisma"

const fetchDashboardMetaData = async (user: IAuthUser) => {
	let metaData
	switch (user?.role) {
		case UserRole.SUPER_ADMIN:
			metaData = getSuperAdminMetaData()
			break
		case UserRole.ADMIN:
			metaData = getAdminMetaData()
			break
		case UserRole.DOCTOR:
			metaData = getDoctorMetaData(user)
			break
		case UserRole.PATIENT:
			metaData = getPatientMetaData(user)
			break
		default:
			throw new Error("Invalid user role")
	}
	return metaData
}

const getSuperAdminMetaData = async () => {
	const appointmentCount = await prisma.appointment.count()
	const doctorCount = await prisma.doctor.count()
	const patientCount = await prisma.patient.count()
	const adminCount = await prisma.admin.count()
	const paymentCount = await prisma.payment.count()

	const revenue = await prisma.payment.aggregate({
		_sum: {
			amount: true,
		},
		where: {
			status: PaymentStatus.PAID,
		},
	})

	return {
		appointmentCount,
		doctorCount,
		adminCount,
		patientCount,
		paymentCount,
		revenue,
	}
}

const getAdminMetaData = async () => {
	const appointmentCount = await prisma.appointment.count()
	const doctorCount = await prisma.doctor.count()
	const patientCount = await prisma.patient.count()
	const paymentCount = await prisma.payment.count()

	const revenue = await prisma.payment.aggregate({
		_sum: {
			amount: true,
		},
		where: {
			status: PaymentStatus.PAID,
		},
	})

	return {
		appointmentCount,
		doctorCount,
		patientCount,
		paymentCount,
		revenue,
	}
}

const getDoctorMetaData = async (user: IAuthUser) => {
	const doctorData = await prisma.doctor.findUnique({
		where: {
			email: user?.email,
		},
	})

	const appointmentCount = await prisma.appointment.count({
		where: {
			doctorId: doctorData?.id,
		},
	})

	const patientCount = await prisma.appointment.groupBy({
		by: ["patientId"],
		_count: {
			id: true,
		},
	})

	const reviewCount = await prisma.review.count({
		where: {
			doctorId: doctorData?.id,
		},
	})

	const revenue = await prisma.payment.aggregate({
		_sum: {
			amount: true,
		},
		where: {
			appointment: {
				doctorId: doctorData?.id,
			},
			status: PaymentStatus.PAID,
		},
	})

	const appointmentDistribution = await prisma.appointment.groupBy({
		by: ["status"],
		_count: { id: true },
		where: {
			doctorId: doctorData?.id,
		},
	})

	const formattedAppointmentDistribution = appointmentDistribution.map(
		({ status, _count }) => ({
			status,
			count: _count.id,
		})
	)

	return {
		appointmentCount,
		patientCount: patientCount.length,
		reviewCount,
		revenue,
		formattedAppointmentDistribution,
	}
}

const getPatientMetaData = async (user: IAuthUser) => {
	const patientData = await prisma.patient.findUnique({
		where: {
			email: user?.email,
		},
	})

	const appointmentCount = await prisma.appointment.count({
		where: {
			patientId: patientData?.id,
		},
	})

	const prescriptionCount = await prisma.prescription.count({
		where: {
			patientId: patientData?.id,
		},
	})

	const reviewCount = await prisma.review.count({
		where: {
			patientId: patientData?.id,
		},
	})

	const appointmentDistribution = await prisma.appointment.groupBy({
		by: ["status"],
		_count: { id: true },
		where: {
			patientId: patientData?.id,
		},
	})

	const formattedAppointmentDistribution = appointmentDistribution.map(
		({ status, _count }) => ({
			status,
			count: _count.id,
		})
	)

	return {
		appointmentCount,
		prescriptionCount,
		reviewCount,
		formattedAppointmentDistribution,
	}
}

export const metaService = {
	fetchDashboardMetaData,
}
