import express from "express"
import { doctorController } from "./doctor.controller"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"

const router = express.Router()

router.get("/", doctorController.getAllDoctors)
router.get("/:id", doctorController.getDoctorById)
router.delete("/:id", doctorController.deleteDoctorById)

export const doctorRoutes = router
