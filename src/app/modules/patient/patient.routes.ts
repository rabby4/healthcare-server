import express from "express"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"
import { patientController } from "./patient.controller"

const router = express.Router()

router.get(
	"/",
	// auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
	patientController.getAllPatient
)

router.get(
	"/:id",
	// auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
	patientController.getPatientById
)

router.patch(
	"/:id",
	// auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
	patientController.updatePatient
)

router.delete(
	"/:id",
	// auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
	patientController.deletePatient
)

router.delete("/soft/:id", patientController.softDeletePatient)

export const patientRoutes = router
