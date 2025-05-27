import express from "express"
import { doctorScheduleController } from "./doctorSchedule.controller"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"

const router = express.Router()

router.get(
	"/my-schedule",
	auth(UserRole.DOCTOR),
	doctorScheduleController.getMySchedules
)

router.post(
	"/",
	auth(UserRole.DOCTOR),
	doctorScheduleController.createDoctorSchedule
)

router.delete(
	"/:id",
	auth(UserRole.DOCTOR),
	doctorScheduleController.deleteSchedule
)

export const doctorScheduleRoutes = router
