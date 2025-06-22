import express from "express"
import { appointmentController } from "./appointment.controller"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"

const router = express.Router()

router.post(
	"/",
	auth(UserRole.PATIENT),
	appointmentController.createAppointment
)

router.get(
	"/my-appointments",
	auth(UserRole.PATIENT, UserRole.DOCTOR),
	appointmentController.getMyAppointments
)

router.get(
	"/",
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
	appointmentController.getAllAppointments
)

export const appointmentRoutes = router
