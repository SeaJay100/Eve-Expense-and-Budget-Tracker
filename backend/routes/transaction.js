import express from 'express'
import Transaction from '../models/Transaction.js'
import Account from '../models/Accounts.js'
import Categories from '../models/Categories.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// protect checks the login token and gives us the logged-in user in req.user.

// Save a transaction for the logged-in user.
router.post('/transaction', protect, async (req, res) => {
    try {
        const { amount, date, account, category, description, type } = req.body || {}

        if (!amount || !date || !account || !category) {
            return res.status(400).json({ message: 'Please fill all the fields.' })
        }

        // The selected account and category must also belong to this user.
        const userAccount = await Account.findOne({ _id: account, user: req.user._id })
        const userCategory = await Categories.findOne({ _id: category, user: req.user._id })

        if (!userAccount || !userCategory) {
            return res.status(400).json({ message: 'Choose an account and category belonging to you.' })
        }

        const transaction = await Transaction.create({
            user: req.user._id,
            amount,
            date,
            account,
            category,
            description,
            type
        })

        return res.status(201).json(transaction)
    } catch (err) {
        if (err.name === 'ValidationError' || err.name === 'CastError') {
            return res.status(400).json({ message: err.message })
        }
        return res.status(500).json({ message: err.message })
    }
})

// Get only the logged-in user's transactions.
router.get('/transaction', protect, async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1, _id: -1 })
        return res.status(200).json(transactions)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

// Check both the transaction ID and the owner before showing a transaction.
router.get('/transaction/:id', protect, async (req, res) => {
    try {
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found.' })
        }

        return res.status(200).json(transaction)
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: err.message })
        }
        return res.status(500).json({ message: err.message })
    }
})

router.put('/transaction/:id', protect, async (req, res) => {
    try {
        const { amount, date, account, category, description, type } = req.body || {}

        // A user can only edit a transaction they own.
        const transaction = await Transaction.findOne({
            _id: req.params.id,
            user: req.user._id
        })

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found.' })
        }

        if (account !== undefined) {
            const userAccount = await Account.findOne({ _id: account, user: req.user._id })
            if (!userAccount) {
                return res.status(400).json({ message: 'Choose an account belonging to you.' })
            }
            transaction.account = account
        }

        if (category !== undefined) {
            const userCategory = await Categories.findOne({ _id: category, user: req.user._id })
            if (!userCategory) {
                return res.status(400).json({ message: 'Choose a category belonging to you.' })
            }
            transaction.category = category
        }

        // Change only the fields sent by the form. The owner stays the same.
        if (amount !== undefined) transaction.amount = amount
        if (date !== undefined) transaction.date = date
        if (description !== undefined) transaction.description = description
        if (type !== undefined) transaction.type = type

        await transaction.save()
        return res.status(200).json(transaction)
    } catch (err) {
        if (err.name === 'ValidationError' || err.name === 'CastError') {
            return res.status(400).json({ message: err.message })
        }
        return res.status(500).json({ message: err.message })
    }
})

router.delete('/transaction/:id', protect, async (req, res) => {
    try {
        // A user can only delete a transaction they own.
        const transaction = await Transaction.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        })

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found.' })
        }

        return res.status(200).json({ message: 'Transaction deleted successfully.' })
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: err.message })
        }
        return res.status(500).json({ message: err.message })
    }
})

export default router
