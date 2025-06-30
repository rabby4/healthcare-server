import { Server } from "http"
import app from "./app"
import config from "./config"

const main = async () => {
	const server: Server = app.listen(config.port, () => {
		console.log(`App is listening at port ${config.port}`)
	})

	const exitHandler = () => {
		if (server) {
			server.close(() => {
				console.log("Server is closed due to uncaught exception")
			})
		}
		process.exit(1)
	}

	process.on("uncaughtException", (error) => {
		console.log(error)
		exitHandler()
	})
	process.on("unhandledRejection", (error) => {
		console.log(error)
		exitHandler()
	})
}

main()
