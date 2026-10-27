const express = require('express')
const cors = require('cors')
const path = require('path')

const PORT = process.env.PORT || 8000

const app = express()

//middleware for cors and json parsing
app.use(express.json())
app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}))

app.get('/', (req, res) => {
    res.send(`Dashboard`)
})

app.listen(PORT, () => {
    console.log(`Port is running on ${PORT}`)
    console.log(`http://localhost:${PORT}`)
})