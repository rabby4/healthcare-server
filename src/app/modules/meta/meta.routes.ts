import express from "express"
import { metaController } from "./meta.controller"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"

const router = express.Router()

router.get(
	"/",
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
	metaController.fetchDashboardMetaData
)

router.get(
	"/appointment-trend",
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.DOCTOR, UserRole.PATIENT),
	metaController.getAppointmentTrend
)

export const metaRoutes = router
