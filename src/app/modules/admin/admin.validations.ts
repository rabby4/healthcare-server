import { z } from "zod"

const updateSchema = z.object({
	body: z.object({
		name: z.string(),
		contactNumber: z.string(),
	}),
})

export const adminValidationSchema = {
	updateSchema,
}
