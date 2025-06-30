import { UserRole } from "@prisma/client"
import { IAuthUser } from "../../interfaces/common"
import prisma from "../../../shared/prisma"

const fetchDashboardMetaData = async (user: IAuthUser) => {
	switch (user?.role) {
		case UserRole.SUPER_ADMIN:
			getSuperAdminMetaData()
			break
		case UserRole.ADMIN:
			getAdminMetaData()
			break
		case UserRole.DOCTOR:
			getDoctorMetaData(user as IAuthUser)
			break
		case UserRole.PATIENT:
			getPatientMetaData()
			break
		default:
			throw new Error("Invalid user role")
	}
}

const getSuperAdminMetaData = async () => {
	console.log("Fetching super admin metadata...")
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
	})

	console.log({
		appointmentCount,
		doctorCount,
		patientCount,
		paymentCount,
		revenue,
	})
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

	console.log(formattedAppointmentDistribution, { depth: "infinity" })
}

const getPatientMetaData = async () => {
	console.log("Fetching patient metadata...")
}

export const metaService = {
	fetchDashboardMetaData,
}
