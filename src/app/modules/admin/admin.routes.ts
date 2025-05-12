import express from "express"
import { adminController } from "./admin.controller"
import validateRequest from "../../middlewares/validateRequest"
import { adminValidationSchema } from "./admin.validations"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"

const router = express.Router()

router.get(
	"/",
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
	adminController.getAllAdmin
)
router.get(
	"/:id",
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
	adminController.getAdminById
)
router.patch(
	"/:id",
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
	validateRequest(adminValidationSchema.updateSchema),
	adminController.updateAdminById
)
router.delete(
	"/:id",
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
	adminController.deleteAdminById
)
router.delete(
	"/soft/:id",
	auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
	adminController.softDeleteAdminById
)

export const adminRoutes = router
