import jwt, { SignOptions } from "jsonwebtoken"

const generateToken = (
	payload: any,
	secret: string,
	expiresIn: string | number
) => {
	const options: SignOptions = {
		algorithm: "HS256",
		expiresIn: expiresIn as any,
	}
	const token = jwt.sign(payload, secret, options)

	return token
}

export const jwtHelpers = {
	generateToken,
}
