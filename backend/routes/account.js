import express from 'express'
import Account from '../models/Accounts.js'

const router = express.Router()

router.post('/account', async (req, res) => {
    try{
        const {accName, accAmount, accType} = req.body ?? {}

        if (!accName || !accAmount || !accType) {
            return res.status(400).json({message: "Please fill all the fields."})
        }
        if (Number(amount) === 0) {
            return res.status(400).json({message: "Account balance cannot be zero."})
        }
        const account = await Account.create({accName, accAmount, accType})
        return res.status(201).json(account)
    } catch (err){
        const status = err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500
        return res.status(status).json({message: err.message})
    }
})

router.get('/account', async (req, res) => {
    try {
        const account = await Account.find()
        return res.status(200).json(account)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

export default router
