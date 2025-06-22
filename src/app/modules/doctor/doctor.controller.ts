import status from "http-status"
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
		statusCode: status.OK,
		success: true,
		message: "All doctors fetched successfully!",
		meta: result.meta,
		data: result.data,
	})
})

const getDoctorById = catchAsync(async (req, res) => {
	const { id } = req.params
	const result = await doctorServices.getDoctorById(id)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Doctor fetched successfully!",
		data: result,
	})
})

const updateDoctorById = catchAsync(async (req, res) => {
	const { id } = req.params
	const data = req.body
	const result = await doctorServices.updateDoctorById(id, data)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Doctor updated successfully!",
		data: result,
	})
})

const deleteDoctorById = catchAsync(async (req, res) => {
	const { id } = req.params
	const result = await doctorServices.deleteDoctorById(id)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Doctor deleted successfully!",
		data: result,
	})
})

const softDeleteAdminById = catchAsync(async (req, res) => {
	const { id } = req.params
	const result = await doctorServices.softDeleteDoctorById(id)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Doctor deleted successfully!",
		data: result,
	})
})

export const doctorController = {
	getAllDoctors,
	getDoctorById,
	updateDoctorById,
	deleteDoctorById,
	softDeleteAdminById,
}
