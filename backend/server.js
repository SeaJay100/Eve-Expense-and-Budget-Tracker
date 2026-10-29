import express from "express"
import dotenv from "dotenv"
import { connectDB } from "./config/db.js"
import authRoute from './routes/auth.js'

dotenv.config()
const app = express()

const PORT = process.env.PORT || 3000

//middleware for json parsing
app.use(express.json())

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

