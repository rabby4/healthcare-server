import express, { NextFunction, Request, Response } from "express"
import { specialtyController } from "./specialties.controller"
import { fileUploader } from "../../../helpers/fileUploader"
import { specialtyValidation } from "./specialties.validation"

const router = express.Router()

router.get("/", specialtyController.getAllSpecialties)

router.post(
	"/",
	fileUploader.upload.single("file"),
	(req: Request, res: Response, next: NextFunction) => {
		req.body = specialtyValidation.createSpecialty.parse(
			JSON.parse(req.body.data)
		)
		return specialtyController.createSpecialty(req, res, next)
	}
)

router.delete("/:id", specialtyController.deleteSpecialty)

export const specialtiesRoutes = router
