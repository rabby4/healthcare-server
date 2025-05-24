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
		message: "All admin fetched successfully!",
		meta: result.meta,
		data: result.data,
	})
})

export const patientController = {
	getAllPatient,
}
