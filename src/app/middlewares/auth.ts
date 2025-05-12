import { NextFunction, Request, Response } from "express"
import { jwtHelpers } from "../../shared/jwtHelper"
import config from "../../config"
import { Secret } from "jsonwebtoken"
import status from "http-status"
import ApiError from "../errors/ApiErrors"

const auth = (...roles: string[]) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const token = req.headers.authorization

			if (!token)
				throw new ApiError(status.UNAUTHORIZED, "You are not authorized!")

			const verifiedUser = jwtHelpers.verifyToken(
				token,
				config.jwt.accessToken as Secret
			)
			req.user = verifiedUser

			if (roles.length && !roles.includes(verifiedUser.role))
				throw new ApiError(status.FORBIDDEN, "You are not authorized!")

			next()
		} catch (error) {
			next(error)
		}
	}
}

export default auth
