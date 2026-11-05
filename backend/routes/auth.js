import express from 'express'
import User from '../models/User.js'
import { protect } from '../middleware/auth.js'
import jwt from 'jsonwebtoken'

const router = express.Router()

//Register
router.post('/register', async (req, res) => {
    try{
        const {username, email, password} = req.body || {}

        if (!username || !email || !password){
            return res.status(400).json({message: "Please fill all the fields."})
        }
        
        const userExist = await User.findOne({email})
        if (userExist) {
            return res.status(400).json({message: "User already exist."})
        }

        const usernameExist = await User.findOne({username})
        if (usernameExist) {
            return res.status(400).json({message: "Username already exists."})
        }

        const user = await User.create({username, email, password})
        const token = generateToken(user._id)
        res.status(201).json({
            id: user._id,
            username: user.username,
            email: user.email,
            token,
        })
    } catch (err) {
        // The database also checks duplicates if two people register at the same time.
        if (err.code === 11000) {
            return res.status(400).json({message: "Username or email already exists."})
        }
        res.status(500).json({message: err.message})
    }
})

//Login
router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body || {}

        if (!email || !password){
            return res.status(400).json({message: "Please fill all the fields."})
        }
        const user = await User.findOne({email})

        if (!user || ! (await user.matchPassword(password))) {
            return res.status(401).json({message: "Invalid credentials"})
        }
        const token = generateToken(user._id)
        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            token,
        })
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

//Me
router.get('/me', protect, async (req, res) => {
    res.status(200).json(req.user)

})

//Generate JWT token
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "30d"})
}

export default router
