import express from "express"
import { paymentController } from "./payment.controller"
import auth from "../../middlewares/auth"
import { UserRole } from "@prisma/client"

const router = express.Router()

// IPN / validation is a server-to-server callback from the payment gateway,
// so it cannot carry a user JWT — it is secured by validating the
// transaction against SSLCommerz inside the service instead.
router.get("/ipn", paymentController.validatePayment)
router.post("/ipn", paymentController.validatePayment)

// Browser redirect targets after payment (public; gateway uses POST or GET).
// success validates + marks PAID, then all three redirect to the frontend.
router.route("/success").get(paymentController.paymentSuccess).post(paymentController.paymentSuccess)
router.route("/fail").get(paymentController.paymentFail).post(paymentController.paymentFail)
router.route("/cancel").get(paymentController.paymentCancel).post(paymentController.paymentCancel)

router.post(
	"/init-payment/:appointmentId",
	auth(UserRole.PATIENT),
	paymentController.initPayment
)

export const paymentRoutes = router
