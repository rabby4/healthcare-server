import { UserRole } from "@prisma/client"
import prisma from "./prisma"
import config from "../config"
import * as bcrypt from "bcrypt"

export const seedSuperAdmin = async () => {
	try {
		const isExistSuperAdmin = await prisma.user.findFirst({
			where: {
				role: UserRole.SUPER_ADMIN,
			},
		})

		if (isExistSuperAdmin) {
			console.log("Super Admin already exists.")
			return
		}

		const hashedPassword = await bcrypt.hash(
			config.superAdminPassword as string,
			12
		)

		const superAdminData = await prisma.user.create({
			data: {
				email: config.superAdminEmail as string,
				password: hashedPassword,
				role: UserRole.SUPER_ADMIN,
				Admin: {
					create: {
						name: "Super Admin",
						contactNumber: "1234567890",
					},
				},
			},
		})
		console.log(superAdminData)
	} catch (error) {
		console.error(error)
	}
	// NOTE: no $disconnect here — this function shares the app-wide prisma
	// client (src/shared/prisma.ts). Disconnecting it on a serverless cold
	// start would kill the very connection the incoming request is using.
}

// Only auto-run (and disconnect afterwards) when executed directly via
// `npm run seed` — importing this module must not have side effects.
if (require.main === module) {
	seedSuperAdmin().finally(() => prisma.$disconnect())
}
