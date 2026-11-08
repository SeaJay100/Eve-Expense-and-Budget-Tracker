import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { fileURLToPath } from "node:url"
import { connectDB } from "./config/db.js"
import authRoute from './routes/auth.js'
import transactionRoute from './routes/transaction.js'
import accountRoute from './routes/account.js'
import categoriesRoute from './routes/categories.js'
import Transaction from './models/Transaction.js'
import Category from './models/Categories.js'

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
app.use("/api", transactionRoute)
app.use("/api", accountRoute)
app.use("/api", categoriesRoute)
app.use(express.static(fileURLToPath(new URL("../frontend/public/", import.meta.url))))


await connectDB()
await Promise.all([Transaction.init(), Category.init()])
app.listen(PORT, () => console.log(`Eve is running at http://localhost:${PORT}/`))

