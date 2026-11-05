import express from 'express'
import Transaction from '../models/Transaction.js'

const router = express.Router()

router.post('/transaction', async (req, res) => {
    const {amount, date, account, category} = req.body

    try{
        if (!amount || !date || !account || !category) {
            return res.status(400).json({message: "Please fill all the fields."})
        }
        const transaction = await Transaction.create({amount, date, account, category})
        return res.status(201).json(transaction)

    } catch (err){
        res.status(500).json({message: err.message})
    }
})

router.put('/transaction/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )

        if (!transaction) {
            return res.status(404).json({
                message: "Transaction not found."
            })
        }

        return res.status(200).json(transaction)
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
})

router.delete('/transaction/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndDelete(req.params.id)

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found." })
        }

        return res.status(200).json({ message: "Transaction deleted successfully." })

    } catch (err) {
        const status = err.name === 'CastError' ? 400 : 500
        return res.status(status).json({ message: err.message })
    }
})

router.get('/transaction', async (req, res) => {
    try {
        const transactions = await Transaction.find()
        return res.status(200).json(transactions)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

router.get('/transaction/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found." })
        }

        return res.status(200).json(transaction)
    } catch (err) {
        const status = err.name === 'CastError' ? 400 : 500
        return res.status(status).json({ message: err.message })
    }
})

export default router
