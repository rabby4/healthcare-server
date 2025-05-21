import express from "express"
import { userRoutes } from "../modules/user/user.routes"
import { adminRoutes } from "../modules/admin/admin.routes"
import { authRoutes } from "../modules/auth/auth.router"
import { specialtiesRoutes } from "../modules/specialties/specialties.routes"
import { doctorRoutes } from "../modules/doctor/doctor.routes"

const router = express.Router()

const moduleRoutes = [
	{
		path: "/user",
		route: userRoutes,
	},
	{
		path: "/admin",
		route: adminRoutes,
	},
	{
		path: "/auth",
		route: authRoutes,
	},
	{
		path: "/specialties",
		route: specialtiesRoutes,
	},
	{
		path: "/doctor",
		route: doctorRoutes,
	},
]

moduleRoutes.forEach((route) => router.use(route.path, route.route))

export default router
