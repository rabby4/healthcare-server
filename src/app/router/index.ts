import express from "express"
import { userRoutes } from "../modules/user/user.routes"
import { adminRoutes } from "../modules/admin/admin.routes"
import { authRoutes } from "../modules/auth/auth.routes"
import { specialtiesRoutes } from "../modules/specialties/specialties.routes"
import { doctorRoutes } from "../modules/doctor/doctor.routes"
import { patientRoutes } from "../modules/patient/patient.routes"
import { ScheduleRoutes } from "../modules/schedule/schedule.routes"
import { doctorScheduleRoutes } from "../modules/doctorSchedule/doctorSchedule.routes"
import { appointmentRoutes } from "../modules/appointment/appointment.routes"
import { paymentRoutes } from "../modules/payment/payment.routes"
import { prescriptionRoutes } from "../modules/prescription/prescription.routes"

const router = express.Router()

const moduleRoutes = [
	{
		path: "/user",
		route: userRoutes,
	},
	{
		path: "/admin",
		route: adminRoutes,
	},
	{
		path: "/auth",
		route: authRoutes,
	},
	{
		path: "/specialties",
		route: specialtiesRoutes,
	},
	{
		path: "/doctor",
		route: doctorRoutes,
	},
	{
		path: "/patient",
		route: patientRoutes,
	},
	{
		path: "/schedule",
		route: ScheduleRoutes,
	},
	{
		path: "/doctor-schedule",
		route: doctorScheduleRoutes,
	},
	{
		path: "/appointment",
		route: appointmentRoutes,
	},
	{
		path: "/payment",
		route: paymentRoutes,
	},
	{
		path: "/prescription",
		route: prescriptionRoutes,
	},
]

moduleRoutes.forEach((route) => router.use(route.path, route.route))

export default router
