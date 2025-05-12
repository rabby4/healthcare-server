import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.join(process.cwd(), ".env") })

export default {
	env: process.env.NODE_ENV,
	port: process.env.PORT,
	jwt: {
		accessToken: process.env.JWT_ACCESS_TOKEN,
		accessTokenExpireIn: process.env.ACCESS_TOKEN_EXPIRE_IN,
		refreshToken: process.env.JWT_REFRESH_TOKEN,
		refreshTokenExpireIn: process.env.REFRESH_TOKEN_EXPIRE_IN,
		resetPassToken: process.env.RESET_PASS_TOKEN,
		resetPassExpireIn: process.env.RESET_PASS_EXPIRE_IN,
	},
	resetPassURL: process.env.RESET_PASS_URL,
	emailSender: {
		email: process.env.EMAIL,
		pass: process.env.APP_PASS,
	},
}
