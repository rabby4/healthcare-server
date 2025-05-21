import express, { NextFunction, Request, Response } from "express"
import { specialtyController } from "./specialties.controller"
import { fileUploader } from "../../../helpers/fileUploader"
import { specialtyValidation } from "./specialties.validation"

const router = express.Router()

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

export const specialtiesRoutes = router
