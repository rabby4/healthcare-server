import { AppointmentStatus, PaymentStatus, Prisma, UserRole } from "@prisma/client"
import { IAuthUser } from "../../interfaces/common"
import config from "../../../config"
import prisma from "../../../shared/prisma"

const VALID_TREND_UNITS = ["year", "month", "week"] as const
type TrendUnit = (typeof VALID_TREND_UNITS)[number]

// The single place where the commission split is computed. The platform keeps
// `config.commissionRate` of every paid fee; the doctor receives the rest.
// `gross` must be a sum over PAID payments only.
const calculateEarnings = (gross: number) => {
	const commission = Math.round(gross * config.commissionRate)
	return {
		gross,
		commission,
		net: gross - commission,
		commissionRate: config.commissionRate,
	}
}

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
		_avg: {
			amount: true,
		},
		where: {
			status: PaymentStatus.PAID,
		},
	})

	const earnings = calculateEarnings(revenue._sum.amount ?? 0)

	const barChartData = await getBarChartData()
	const pieChartData = await getPieChartData()

	return {
		appointmentCount,
		doctorCount,
		adminCount,
		patientCount,
		paymentCount,
		revenue,
		earnings,
		barChartData,
		pieChartData,
	}
}

const getAdminMetaData = async () => {
	const appointmentCount = await prisma.appointment.count()
	const doctorCount = await prisma.doctor.count()
	const patientCount = await prisma.patient.count()
	const paymentCount = await prisma.payment.count()
	// Admins can see how many (non-super) admins exist, but never the super admin.
	const adminCount = await prisma.admin.count({
		where: { user: { role: { not: UserRole.SUPER_ADMIN } } },
	})

	const revenue = await prisma.payment.aggregate({
		_sum: {
			amount: true,
		},
		_avg: {
			amount: true,
		},
		where: {
			status: PaymentStatus.PAID,
		},
	})

	const earnings = calculateEarnings(revenue._sum.amount ?? 0)

	const barChartData = await getBarChartData()
	const pieChartData = await getPieChartData()

	return {
		appointmentCount,
		doctorCount,
		patientCount,
		paymentCount,
		adminCount,
		revenue,
		earnings,
		barChartData,
		pieChartData,
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

	const completedAppointmentCount = await prisma.appointment.count({
		where: {
			doctorId: doctorData?.id,
			status: AppointmentStatus.COMPLETED,
		},
	})

	// Unique patients this doctor has seen — a patient with multiple
	// appointments counts once (distinct on patientId).
	const patientCount = await prisma.appointment.groupBy({
		by: ["patientId"],
		_count: {
			id: true,
		},
		where: {
			doctorId: doctorData?.id,
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

	const earnings = calculateEarnings(revenue._sum.amount ?? 0)

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
		completedAppointmentCount,
		patientCount: patientCount.length,
		reviewCount,
		revenue,
		earnings,
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

const getBarChartData = async () => {
	const appointmentCountByMonth: { month: Date; count: bigint }[] =
		await prisma.$queryRaw`
		SELECT DATE_TRUNC('month', "createdAt") AS month,
		CAST(COUNT(*) AS INTEGER) AS count
		FROM "appointments"
		GROUP BY month
		ORDER BY month DESC
	`

	return appointmentCountByMonth
}

// Appointment counts grouped by a selectable time unit (year / month / week),
// for the "Appointments · by ___" chart. Admins/super-admins see platform-wide
// data; doctors and patients are scoped to their own appointments.
const getAppointmentTrend = async (user: IAuthUser, unitInput?: string) => {
	const unit: TrendUnit = VALID_TREND_UNITS.includes(unitInput as TrendUnit)
		? (unitInput as TrendUnit)
		: "month"

	let scope: Prisma.Sql = Prisma.empty
	if (user?.role === UserRole.DOCTOR) {
		const doctor = await prisma.doctor.findUnique({
			where: { email: user.email },
			select: { id: true },
		})
		scope = Prisma.sql`WHERE "doctorId" = ${doctor?.id ?? ""}`
	} else if (user?.role === UserRole.PATIENT) {
		const patient = await prisma.patient.findUnique({
			where: { email: user.email },
			select: { id: true },
		})
		scope = Prisma.sql`WHERE "patientId" = ${patient?.id ?? ""}`
	}

	// `unit` is whitelisted above and bound as a parameter to date_trunc(text,
	// timestamp), so this raw query is injection-safe.
	const query = Prisma.sql`
		SELECT DATE_TRUNC(${unit}, "createdAt") AS period,
		       CAST(COUNT(*) AS INTEGER) AS count
		FROM "appointments"
		${scope}
		GROUP BY period
		ORDER BY period ASC
	`

	const trend = await prisma.$queryRaw<{ period: Date; count: number }[]>(query)

	return { unit, trend }
}

const getPieChartData = async () => {
	const appointmentDistribution = await prisma.appointment.groupBy({
		by: ["status"],
		_count: { id: true },
	})

	const formattedAppointmentDistribution = appointmentDistribution.map(
		({ status, _count }) => ({
			status,
			count: _count.id,
		})
	)
	return formattedAppointmentDistribution
}

export const metaService = {
	fetchDashboardMetaData,
	getAppointmentTrend,
}
