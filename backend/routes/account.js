import express from 'express'
import Account from '../models/Accounts.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// protect makes the logged-in user available as req.user.
router.post('/account', protect, async (req, res) => {
    try{
        const {accName, accAmount, accType} = req.body || {}

        if (!accName || accAmount === undefined || accAmount === null || accAmount === '' || !accType) {
            return res.status(400).json({message: "Please fill all the fields."})
        }
        if (Number(accAmount) === 0) {
            return res.status(400).json({message: "Account balance cannot be zero."})
        }
        // Save the owner's ID with the account.
        const account = await Account.create({
            user: req.user._id,
            accName,
            accAmount,
            accType
        })
        return res.status(201).json(account)
    } catch (err){
        if (err.name === 'ValidationError' || err.name === 'CastError') {
            return res.status(400).json({message: err.message})
        }
        return res.status(500).json({message: err.message})
    }
})

router.get('/account', protect, async (req, res) => {
    try {
        // Show only accounts owned by the logged-in user.
        const account = await Account.find({ user: req.user._id })
        return res.status(200).json(account)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

export default router
