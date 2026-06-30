import { Request } from "express"
import { fileUploader } from "../../../helpers/fileUploader"
import prisma from "../../../shared/prisma"

const createSpecialty = async (req: Request) => {
	const file = req.file
	if (file) {
		const uploadToCloudinary = await fileUploader.uploadToCloudinary(file)
		req.body.icon = uploadToCloudinary?.secure_url
	}

	const result = await prisma.specialties.create({
		data: req.body,
	})

	return result
}

const getAllSpecialties = async () => {
	const result = await prisma.specialties.findMany({
		include: {
			// Number of (non-deleted) doctors registered under each specialty,
			// exposed as `_count.doctorSpecialties` on every specialty.
			_count: {
				select: {
					doctorSpecialties: {
						where: { doctor: { isDeleted: false } },
					},
				},
			},
		},
	})
	return result
}

const deleteSpecialty = async (id: string) => {
	const result = await prisma.specialties.delete({
		where: {
			id,
		},
	})
	return result
}

export const specialtyServices = {
	createSpecialty,
	getAllSpecialties,
	deleteSpecialty,
}
