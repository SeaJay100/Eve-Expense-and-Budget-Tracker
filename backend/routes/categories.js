import express from 'express'
import Categories from "../models/Categories.js"

const router = express.Router()

router.get('/categories', async (req, res) => {
    try {
        const categories = await Account.find()
        return res.status(200).json(categories)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

router.post('/categories', async (req, res) => {
    try{
        const {categName, categType, categBudget} = req.body ?? {}

        if (!categName || !categType || !categBudget) {
            return res.status(400).json({message: "Please fill all the fields."})
        }
        if (Number(amount) === 0) {
            return res.status(400).json({message: "Category budget cannot be zero."})
        }
        const categories = await Categories.create({categName, categType, categBudget})
        return res.status(201).json(categories)
    } catch (err){
        const status = err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500
        return res.status(status).json({message: err.message})
    }
})

export default router