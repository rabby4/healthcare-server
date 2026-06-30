import { Gender } from "@prisma/client"
import { z } from "zod"

const createAdmin = z.object({
	password: z.string({
		error: "Password is required",
	}),
	admin: z.object({
		name: z.string({
			error: "Name is required",
		}),
		email: z.string({
			error: "Email is required",
		}),
		contactNumber: z.string({
			error: "Contact number is required",
		}),
	}),
})

const createDoctor = z.object({
	password: z.string({
		error: "Password is required",
	}),
	doctor: z.object({
		name: z.string({
			error: "Name is required",
		}),
		email: z.string({
			error: "Email is required",
		}),
		contactNumber: z.string({
			error: "Contact number is required",
		}),
		address: z.string().optional(),
		registrationNumber: z.string({
			error: "Registration number is required",
		}),
		experience: z.number({
			error: "Experience is required",
		}),
		gender: z.enum([Gender.MALE, Gender.FEMALE]),
		appointmentFee: z.number({
			error: "Appointment fee is required",
		}),
		qualification: z.string({
			error: "Qualification is required",
		}),
		currentWorkingPlace: z.string({
			error: "Current working place is required",
		}),
	}),
	// Optional list of specialty ids to link to the doctor on creation.
	specialties: z.array(z.string()).optional(),
})

const createPatient = z.object({
	password: z.string({
		error: "Password is required",
	}),
	patient: z.object({
		name: z.string({
			error: "Name is required",
		}),
		email: z.string({
			error: "Email is required",
		}),
		contactNumber: z.string({
			error: "Contact number is required",
		}),
	}),
})

export const userValidation = {
	createAdmin,
	createDoctor,
	createPatient,
}
