import catchAsync from "../../../shared/catchAsync"
import pick from "../../../shared/pick"
import sendResponse from "../../../shared/sendResponse"
import { doctorFilterFields, paginationOptions } from "./doctor.constant"
import { doctorServices } from "./doctor.service"

const getAllDoctors = catchAsync(async (req, res) => {
	const filters = pick(req.query, doctorFilterFields)
	const options = pick(req.query, paginationOptions)
	const result = await doctorServices.getAllDoctors(filters, options)
	sendResponse(res, {
		statusCode: 200,
		success: true,
		message: "All doctors fetched successfully!",
		meta: result.meta,
		data: result.data,
	})
})

export const doctorController = {
	getAllDoctors,
}
