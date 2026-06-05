import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.join(process.cwd(), ".env") })

export default {
	env: process.env.NODE_ENV,
	port: process.env.PORT,
	frontendUrl: process.env.FRONTEND_URL || "http://localhost:3001",
	backendBaseUrl:
		process.env.BACKEND_BASE_URL || "http://localhost:5000/api/v1",
	jwt: {
		accessToken: process.env.JWT_ACCESS_TOKEN,
		accessTokenExpireIn: process.env.ACCESS_TOKEN_EXPIRE_IN,
		refreshToken: process.env.JWT_REFRESH_TOKEN,
		refreshTokenExpireIn: process.env.REFRESH_TOKEN_EXPIRE_IN,
		resetPassToken: process.env.RESET_PASS_TOKEN,
		resetPassExpireIn: process.env.RESET_PASS_EXPIRE_IN,
	},
	// Platform commission taken from each paid doctor fee (0.15 = 15%).
	// Single source of truth — change it here (or via COMMISSION_RATE env) only.
	commissionRate: process.env.COMMISSION_RATE
		? Number(process.env.COMMISSION_RATE)
		: 0.15,
	superAdminEmail: process.env.SUPER_ADMIN_EMAIL,
	superAdminPassword: process.env.SUPER_ADMIN_PASSWORD,
	resetPassURL: process.env.RESET_PASS_URL,
	emailSender: {
		email: process.env.EMAIL,
		pass: process.env.APP_PASS,
	},
	cloudinary: {
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
	},
	ssl: {
		store_id: process.env.STORE_ID,
		store_passwd: process.env.STORE_PASSWORD,
		success_url: process.env.SUCCESS_URL,
		cancel_url: process.env.CANCEL_URL,
		fail_url: process.env.FAIL_URL,
		payment_api: process.env.PAYMENT_API,
		validation_api: process.env.VALIDATION_API,
	},
}
