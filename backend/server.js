import express from "express"
import dotenv from "dotenv"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { connectDB } from "./config/db.js"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const currentDir = path.dirname(fileURLToPath(import.meta.url))
const frontendPublicDir = path.join(currentDir, "..", "frontend", "public")

app.use(express.json())
app.use(express.static(frontendPublicDir))

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`The port is running on ${PORT}`)
        console.log(`http://localhost:${PORT}/`)
    })
})
