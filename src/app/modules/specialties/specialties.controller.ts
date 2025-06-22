import status from "http-status"
import catchAsync from "../../../shared/catchAsync"
import sendResponse from "../../../shared/sendResponse"
import { specialtyServices } from "./specialties.service"

const createSpecialty = catchAsync(async (req, res) => {
	const result = await specialtyServices.createSpecialty(req)

	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Specialty created successfully",
		data: result,
	})
})

const getAllSpecialties = catchAsync(async (req, res) => {
	const result = await specialtyServices.getAllSpecialties()

	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Specialties retrieved successfully",
		data: result,
	})
})

const deleteSpecialty = catchAsync(async (req, res) => {
	const { id } = req.params
	const result = await specialtyServices.deleteSpecialty(id)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Specialty deleted successfully",
		data: result,
	})
})

export const specialtyController = {
	createSpecialty,
	getAllSpecialties,
	deleteSpecialty,
}
