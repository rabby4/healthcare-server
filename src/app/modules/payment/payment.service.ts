import prisma from "../../../shared/prisma"
import { sslService } from "../SSL/ssl.service"
import { PaymentStatus } from "@prisma/client"
import ApiError from "../../errors/ApiErrors"
import status from "http-status"

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

// amount=1150.00&bank_tran_id=151114130739MqCBNx5&card_brand=VISA&card_issuer=BRAC+BANK%2C+LTD.&card_issuer_country=Bangladesh&card_issuer_country_code=BD&card_no=432149XXXXXX0667&card_type=VISA-Brac+bank¤cy=BDT&status=VALID&store_amount=1104.00&store_id=rejex68585d0aae29b&tran_date=2015-11-14+13%3A07%3A12&tran_id=5646dd9d4b484&val_id=151114130742Bj94IBUk4uE5GRj&verify_sign=24c2c1bbaaa12a79b8c582d6ae542b5e&verify_key=amount%2Cbank_tran_id%2Ccard_brand%2Ccard_issuer%2Ccard_issuer_country%2Ccard_issuer_country_code%2Ccard_no%2Ccard_type%2Ccurrency%2Cstatus%2Cstore_amount%2Cstore_id%2Ctran_date%2Ctran_id%2Cval_id

const validatePayment = async (payload: any) => {
	// the gateway redirect/IPN must report a successful transaction status
	if (
		!payload ||
		!payload.status ||
		!(payload.status === "VALID" || payload.status === "VALIDATED")
	) {
		throw new ApiError(status.BAD_REQUEST, "Invalid payment!")
	}

	// Idempotency: the success redirect AND the IPN can both fire for the same
	// transaction — if it's already PAID, don't re-validate/re-charge.
	if (payload.tran_id) {
		const existing = await prisma.payment.findFirst({
			where: { transactionId: payload.tran_id },
		})
		if (existing?.status === PaymentStatus.PAID) {
			return { message: "Payment already confirmed" }
		}
	}

	// confirm the transaction with SSLCommerz before trusting it
	const response = await sslService.paymentValidation(payload)

	if (
		!response ||
		!(response.status === "VALID" || response.status === "VALIDATED")
	) {
		throw new ApiError(status.BAD_REQUEST, "Payment validation failed!")
	}

	await prisma.$transaction(async (tx) => {
		const updatedPaymentData = await tx.payment.update({
			where: {
				transactionId: response.tran_id,
			},
			data: {
				status: PaymentStatus.PAID,
				paymentGatewayData: response,
			},
		})
		await tx.appointment.update({
			where: {
				id: updatedPaymentData.appointmentId,
			},
			data: {
				paymentStatus: PaymentStatus.PAID,
			},
		})
	})

	return {
		message: "Payment successful",
	}
}

export const paymentService = {
	initPayment,
	validatePayment,
}
