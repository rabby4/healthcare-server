// Vercel serverless entry — the Express app itself is the request handler.
// All routes are rewritten here via vercel.json; the original URL is
// preserved, so Express routing works unchanged.
// Local development still uses src/server.ts (`npm run dev`).
import app from "../src/app"

export default app
