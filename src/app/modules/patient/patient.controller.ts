import status from "http-status"
import catchAsync from "../../../shared/catchAsync"
import pick from "../../../shared/pick"
import sendResponse from "../../../shared/sendResponse"
import { paginationOptions, patientFilterableFields } from "./patient.constant"
import { patientService } from "./patient.service"

const getAllPatient = catchAsync(async (req, res) => {
	const filters = pick(req.query, patientFilterableFields)
	const options = pick(req.query, paginationOptions)
	const result = await patientService.getAllPatient(filters, options)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "All patient fetched successfully!",
		meta: result.meta,
		data: result.data,
	})
})

const getPatientById = catchAsync(async (req, res) => {
	const { id } = req.params
	const result = await patientService.getPatientById(id)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Patient data fetched by id!",
		data: result,
	})
})

const updatePatient = catchAsync(async (req, res) => {
	const { id } = req.params
	const result = await patientService.updatePatient(id, req.body)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Patient update successfully!",
		data: result,
	})
})

export const patientController = {
	getAllPatient,
	getPatientById,
	updatePatient,
}
