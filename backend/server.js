require("dotenv").config()
const express = require("express")
const cors = require("cors")
const path = require("path")
const PORT = process.env.PORT || 8801


const app = express()

//midleware
app.use(express.json())
app.use(
    cors({
        origin: process.env.CLIENT_URL || '*',
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"]
}))

app.listen(PORT, () => {
    console.log(`The server is running on port ${PORT}`)
    console.log(`http://localhost/${PORT}`)
})