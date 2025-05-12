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
	},
}
