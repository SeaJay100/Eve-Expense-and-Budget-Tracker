import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { connectDB } from "./config/db.js"
import authRoute from './routes/auth.js'

dotenv.config()
const app = express()

const PORT = process.env.PORT || 3000

//middleware for json parsing
app.use(express.json())
app.use(cors({
    origin: ["http://localhost:5502", "http://127.0.0.1:5502"],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ["Content-Type", "Authorization"],
}))

app.use("/api/users", authRoute)


connectDB()

app.listen(PORT, () => {
    try {
        console.log(`The port is running on ${PORT}`)
        console.log(`http://localhost:${PORT}/`)
    } catch (err) {
        console.log({message: err})
    }
})

