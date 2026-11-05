import express from 'express'
import Categories from "../models/Categories.js"
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/categories', protect, async (req, res) => {
    try {
        // Show only categories owned by the logged-in user.
        const categories = await Categories.find({ user: req.user._id })
        return res.status(200).json(categories)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

// protect makes the logged-in user available as req.user.
router.post('/categories', protect, async (req, res) => {
    try{
        const {categName, categType, categBudget} = req.body || {}

        if (!categName || !categType || categBudget === undefined || categBudget === null || categBudget === '') {
            return res.status(400).json({message: "Please fill all the fields."})
        }
        if (Number(categBudget) === 0) {
            return res.status(400).json({message: "Category budget cannot be zero."})
        }
        // Save the owner's ID with the category.
        const categories = await Categories.create({
            user: req.user._id,
            categName,
            categType,
            categBudget
        })
        return res.status(201).json(categories)
    } catch (err){
        if (err.name === 'ValidationError' || err.name === 'CastError') {
            return res.status(400).json({message: err.message})
        }
        return res.status(500).json({message: err.message})
    }
})

export default router
