require('dotenv').config()

const express = require('express')
const path = require('path')
const cors = require('cors')
const mongoose = require('mongoose')
const { hash } = require('bcrypt')

const app = express()

const PORT = process.env.PORT || 3000
const MONGOURI = process.env.MONGO_URI || process.env.MONGODB_URI

//middleware for json parsing
app.use(express.json())
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')))

mongoose.connect(MONGOURI).then(() => {
    console.log(`Database is connected...`)
    app.listen(PORT, () => {
        console.log(`Port is running on ${PORT}`)
        console.log(`http://localhost:${PORT}`)
    })
}).catch((error) => console.log(error))

const userSchema = new mongoose.Schema ({
    userName: String,
    password: String
})

const userModel = mongoose.model('users', userSchema)


app.get('/Users', async(req, res) => {
    const userData = await userModel.find()
    res.json(userData)
})
