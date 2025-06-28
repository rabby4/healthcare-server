import prisma from "../../../shared/prisma"
import { sslService } from "../SSL/ssl.service"

const initPayment = async (appointmentId: string) => {
	const paymentData = await prisma.payment.findFirstOrThrow({
		where: {
			appointmentId,
		},
		include: {
			appointment: {
				include: {
					patient: true,
				},
			},
		},
	})

	const result = await sslService.initPayment(paymentData)
	return {
		paymentUrl: result.GatewayPageURL,
	}
}

export const paymentService = {
	initPayment,
}
