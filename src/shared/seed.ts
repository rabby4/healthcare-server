import { UserRole } from "@prisma/client"
import prisma from "./prisma"
import config from "../config"
import * as bcrypt from "bcrypt"

const seedSuperAdmin = async () => {
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
	} finally {
		await prisma.$disconnect()
	}
}

seedSuperAdmin()
