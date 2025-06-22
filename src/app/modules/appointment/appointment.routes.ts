import express from "express"
import { appointmentController } from "./appointment.controller"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"
import validateRequest from "../../middlewares/validateRequest"
import { AppointmentValidation } from "./appointment.validation"

const router = express.Router()

router.post(
	"/",
	auth(UserRole.PATIENT),
	validateRequest(AppointmentValidation.createAppointment),
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
