import express from "express"
import { adminController } from "./admin.controller"
import validateRequest from "../../middlewares/validateRequest"
import { adminValidationSchema } from "./admin.validations"

const router = express.Router()

router.get("/", adminController.getAllAdmin)
router.get("/:id", adminController.getAdminById)
router.patch(
	"/:id",
	validateRequest(adminValidationSchema.updateSchema),
	adminController.updateAdminById
)
router.delete("/:id", adminController.deleteAdminById)
router.delete("/soft/:id", adminController.softDeleteAdminById)

export const adminRoutes = router
