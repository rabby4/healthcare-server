import express from "express"
import { doctorController } from "./doctor.controller"

const router = express.Router()

router.get("/", doctorController.getAllDoctors)
router.get("/:id", doctorController.getDoctorById)
router.patch("/:id", doctorController.updateDoctorById)
router.delete("/:id", doctorController.deleteDoctorById)
router.delete("/soft/:id", doctorController.softDeleteAdminById)

export const doctorRoutes = router
