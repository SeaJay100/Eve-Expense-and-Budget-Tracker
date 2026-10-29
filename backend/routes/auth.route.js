import express from 'express'
import User from '../models/User.js'

const router = express.Router()

router.post('/Register', async (req, res) => {
    const {username, email, password} = req.body
    try{
        if (!username || !email || !password){
            return res.status(400).json({message: "Please fill all the fields."})
        }
        
        const userExist = await User.findOne({email})
        if (userExist) {
            return res.status(400).json({messsage: "User already exist."})
        }

        const user = await User.creat({username, email, password})
        res.status(201).json({
            id: user._id,
            username: user.username,
            email: user.email,
        })
    } catch (err) {
        res.status(500).json({message: err})
    }
})