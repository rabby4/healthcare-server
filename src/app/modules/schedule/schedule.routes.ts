import express from "express"
import { scheduleController } from "./schedule.controller"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"

const router = express.Router()

router.get("/", auth(UserRole.DOCTOR), scheduleController.getAllSchedules)

router.post(
	"/",
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
	scheduleController.createSchedule
)

export const ScheduleRoutes = router
