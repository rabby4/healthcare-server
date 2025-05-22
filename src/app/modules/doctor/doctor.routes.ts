import express from "express"
import { doctorController } from "./doctor.controller"

const router = express.Router()

router.get("/", doctorController.getAllDoctors)
router.get("/:id", doctorController.getDoctorById)

export const doctorRoutes = router
