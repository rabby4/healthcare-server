import express from "express"
import { prescriptionController } from "./prescription.controller"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"

const router = express.Router()

router.post(
	"/",
	auth(UserRole.DOCTOR),
	prescriptionController.createPrescription
)

router.get(
	"/my-prescriptions",
	auth(UserRole.PATIENT),
	prescriptionController.patientPrescription
)

export const prescriptionRoutes = router
