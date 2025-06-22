import { NextFunction, Request, Response } from "express"
import { userServices } from "./user.service"
import catchAsync from "../../../shared/catchAsync"
import pick from "../../../shared/pick"
import { paginationOptions } from "../admin/admin.constant"
import sendResponse from "../../../shared/sendResponse"
import status from "http-status"
import { userFilterableFields } from "./user.constant"
import { IAuthUser } from "../../interfaces/common"

const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const result = await userServices.createAdmin(req)
		res.status(200).json({
			success: true,
			message: "Admin created successfully",
			data: result,
		})
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: error.name || "Something want wrong!",
			error,
		})
	}
}

const createDoctor = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const result = await userServices.createDoctor(req)
		res.status(200).json({
			success: true,
			message: "Doctor created successfully",
			data: result,
		})
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: error.name || "Something want wrong!",
			error,
		})
	}
}

const createPatient = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const result = await userServices.createPatient(req)
		res.status(200).json({
			success: true,
			message: "Patient created successfully",
			data: result,
		})
	} catch (error: any) {
		res.status(500).json({
			success: false,
			message: error.name || "Something want wrong!",
			error,
		})
	}
}

const getAllUsers = catchAsync(async (req, res) => {
	const filters = pick(req.query, userFilterableFields)
	const options = pick(req.query, paginationOptions)
	const result = await userServices.getAllUsers(filters, options)

	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "All users fetched successfully!",
		meta: result.meta,
		data: result.data,
	})
})

const changeProfileStatus = catchAsync(async (req, res) => {
	const { id } = req.params

	const result = await userServices.changeProfileStatus(id, req.body)

	sendResponse(res, {
		statusCode: status.OK,
		success: true,
		message: "User status changed successfully!",
		data: result,
	})
})

const getMyProfile = catchAsync(
	async (req: Request & { user?: IAuthUser }, res) => {
		const user = req.user
		const result = await userServices.getMyProfile(user as IAuthUser)

		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "User profile fetched successfully!",
			data: result,
		})
	}
)

const updateMyProfile = catchAsync(
	async (req: Request & { user?: IAuthUser }, res) => {
		const user = req.user
		const result = await userServices.updateMyProfile(user as IAuthUser, req)

		sendResponse(res, {
			statusCode: status.OK,
			success: true,
			message: "My profile updated successfully!",
			data: result,
		})
	}
)

export const userController = {
	createAdmin,
	createDoctor,
	createPatient,
	getAllUsers,
	changeProfileStatus,
	getMyProfile,
	updateMyProfile,
}
