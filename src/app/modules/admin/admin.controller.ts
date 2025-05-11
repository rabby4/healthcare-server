import { adminServices } from "./admin.service"
import pick from "../../../shared/pick"
import { adminFilterFields, paginationOptions } from "./admin.constant"
import sendResponse from "../../../shared/sendResponse"
import status from "http-status"
import catchAsync from "../../../shared/catchAsync"

const getAllAdmin = catchAsync(async (req, res) => {
	const filters = pick(req.query, adminFilterFields)
	const options = pick(req.query, paginationOptions)
	const result = await adminServices.getAllAdmin(filters, options)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "All admin fetched successfully!",
		meta: result.meta,
		data: result.data,
	})
})

const getAdminById = catchAsync(async (req, res) => {
	const { id } = req.params
	const result = await adminServices.getAdminById(id)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Admin data fetched by id!",
		data: result,
	})
})

const updateAdminById = catchAsync(async (req, res) => {
	const { id } = req.params
	const data = req.body
	const result = await adminServices.updateAdminById(id, data)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Admin data updated!",
		data: result,
	})
})

const deleteAdminById = catchAsync(async (req, res) => {
	const { id } = req.params
	const result = await adminServices.deleteAdminById(id)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Admin data deleted!",
		data: result,
	})
})

const softDeleteAdminById = catchAsync(async (req, res) => {
	const { id } = req.params
	const result = await adminServices.softDeleteAdminById(id)
	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "Admin data deleted!",
		data: result,
	})
})

export const adminController = {
	getAllAdmin,
	getAdminById,
	updateAdminById,
	deleteAdminById,
	softDeleteAdminById,
}
