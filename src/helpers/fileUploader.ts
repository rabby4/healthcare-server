import multer from "multer"
import os from "os"
import path from "path"
import { v2 as cloudinary } from "cloudinary"
import fs from "fs"
import { ICloudinaryFile, IFile } from "../app/interfaces/file"
import config from "../config"

// On Vercel the filesystem is read-only except the OS temp dir, so uploads
// are staged there before being pushed to Cloudinary (then deleted).
const uploadDir = process.env.VERCEL
	? os.tmpdir()
	: path.join(process.cwd(), "uploads")

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		fs.mkdirSync(uploadDir, { recursive: true })
		cb(null, uploadDir)
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname)
	},
})

const upload = multer({ storage: storage })

const uploadToCloudinary = async (
	file: IFile
): Promise<ICloudinaryFile | undefined> => {
	cloudinary.config({
		cloud_name: config.cloudinary.cloud_name,
		api_key: config.cloudinary.api_key,
		api_secret: config.cloudinary.api_secret,
	})

	return new Promise((resolve, reject) => {
		cloudinary.uploader.upload(
			file.path,

			(error: Error, result: ICloudinaryFile) => {
				fs.unlinkSync(file.path)
				if (error) {
					reject(error)
				} else {
					resolve(result)
				}
			}
		)
	})
}

export const fileUploader = {
	upload,
	uploadToCloudinary,
}
