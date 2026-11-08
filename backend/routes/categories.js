import express from 'express'
import Categories from "../models/Categories.js"
import Transaction from '../models/Transaction.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

const defaultCategories = [
    { templateKey: 'food', categName: 'Food & Drink', categType: 'expense', subcategories: ['Groceries', 'Dining out', 'Coffee', 'Bakery', 'Snacks'] },
    { templateKey: 'transport', categName: 'Transportation', categType: 'expense', subcategories: ['Gas', 'Parking', 'Public transportation', 'Toll', 'Maintenance'] },
    { templateKey: 'bills', categName: 'Bills & Utilities', categType: 'expense', subcategories: ['Electricity', 'Water', 'Internet', 'Mobile plan', 'Other utility'] },
    { templateKey: 'shopping', categName: 'Shopping', categType: 'expense', subcategories: ['Clothing', 'Home goods', 'Electronics', 'Online order', 'Gifts'] },
    { templateKey: 'health', categName: 'Health', categType: 'expense', subcategories: ['Pharmacy', 'Doctor', 'Dental', 'Vision', 'Fitness'] },
    { templateKey: 'personalCare', categName: 'Personal Care', categType: 'expense', subcategories: ['Toiletries', 'Haircut', 'Skincare', 'Cosmetics', 'Personal products'] },
    { templateKey: 'salary', categName: 'Salary', categType: 'income', subcategories: ['Paycheck', 'Bonus', 'Commission', 'Allowance', 'Other income'] },
    { templateKey: 'freelance', categName: 'Freelance', categType: 'income', subcategories: ['Design project', 'Consulting', 'Contract work', 'Tutoring', 'Other freelance'] }
]

const addableExpenseCategories = {
    housing: { categName: 'Housing & Rent', subcategories: ['Rent', 'Mortgage payment', 'Home maintenance', 'Security deposit', 'Property tax'] },
    appliances: { categName: 'Appliances', subcategories: ['Refrigerators', 'Washing machines', 'Kitchen appliances', 'Small appliances', 'Appliance repairs'] },
    furniture: { categName: 'Furniture', subcategories: ['Sofa & seating', 'Beds & mattresses', 'Tables & chairs', 'Storage', 'Furniture repairs'] },
    tax: { categName: 'Tax', subcategories: ['Income tax', 'Property tax', 'Vehicle tax', 'Sales tax', 'Filing fees'] },
    hotels: { categName: 'Hotels', subcategories: ['Hotel stays', 'Resort stays', 'Booking fees', 'Meals', 'Service charges'] }
}

function normalizeSubcategories(value) {
    if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) return null
    return [...new Map(value.map(item => item.trim()).filter(Boolean).map(item => [item.toLocaleLowerCase(), item])).values()]
}

async function ensureDefaultCategories(userId) {
    const existing = await Categories.find({ user: userId })

    for (const template of defaultCategories) {
        const category = existing.find(item => item.templateKey === template.templateKey)
            || existing.find(item => !item.templateKey
                && item.categType === template.categType
                && item.categName.trim().toLocaleLowerCase() === template.categName.toLocaleLowerCase())

        if (category) {
            if (category.deletedAt) continue

            const changes = {}
            const untaggedLegacyCategory = !category.templateKey
            if (untaggedLegacyCategory) changes.templateKey = template.templateKey

            const stored = await Categories.collection.findOne(
                { _id: category._id },
                { projection: { subcategories: 1 } }
            )
            if (untaggedLegacyCategory || !Array.isArray(stored?.subcategories)) {
                changes.subcategories = template.subcategories
            }
            if (Object.keys(changes).length) {
                try {
                    await Categories.updateOne({ _id: category._id, user: userId }, { $set: changes })
                } catch (error) {
                    if (error.code !== 11000) throw error
                }
            }
            continue
        }

        try {
            await Categories.updateOne(
                { user: userId, templateKey: template.templateKey },
                { $setOnInsert: { ...template, user: userId, categBudget: 0 } },
                { upsert: true }
            )
        } catch (error) {
            if (error.code !== 11000) throw error
        }
    }
}

router.get('/categories', protect, async (req, res) => {
    try {
        const query = { user: req.user._id }
        if (req.query.includeDeleted !== 'true') query.deletedAt = null
        const categories = await Categories.find(query)
        return res.status(200).json(categories)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

router.post('/categories/defaults', protect, async (req, res) => {
    try {
        await ensureDefaultCategories(req.user._id)
        const categories = await Categories.find({ user: req.user._id, deletedAt: null })
        return res.status(200).json(categories)
    } catch (err) {
        return res.status(500).json({ message: err.message })
    }
})

// protect makes the logged-in user available as req.user.
router.post('/categories', protect, async (req, res) => {
    try{
        const { categName, categType = 'expense', categBudget = 0, subcategories, templateKey = null } = req.body || {}
        const template = templateKey && Object.hasOwn(addableExpenseCategories, templateKey)
            ? addableExpenseCategories[templateKey]
            : null
        const name = typeof categName === 'string' && categName.trim()
            ? categName.trim()
            : template?.categName || ''
        const budget = Number(categBudget)
        const categoriesToSave = subcategories === undefined ? template?.subcategories || [] : subcategories
        const cleanSubcategories = normalizeSubcategories(categoriesToSave)

        if (!name || !['expense', 'income'].includes(categType)) {
            return res.status(400).json({ message: 'Enter a category name and choose Expense or Income.' })
        }
        if (templateKey && !template) {
            return res.status(400).json({ message: 'Choose a category from the available list.' })
        }
        if (template && categType !== 'expense') {
            return res.status(400).json({ message: 'This category can only be added as an expense.' })
        }
        if (!Number.isFinite(budget) || budget < 0) {
            return res.status(400).json({ message: 'Category budget must be zero or more.' })
        }
        if (!cleanSubcategories) {
            return res.status(400).json({ message: 'Subcategories must be a list of names.' })
        }

        const values = {
            user: req.user._id,
            categName: name,
            categType,
            categBudget: budget,
            templateKey: templateKey || null,
            subcategories: cleanSubcategories
        }
        let category
        try {
            category = await Categories.create(values)
        } catch (err) {
            if (err.code !== 11000 || !templateKey) throw err
            const match = { user: req.user._id, templateKey }
            category = await Categories.findOneAndUpdate(
                { ...match, deletedAt: { $ne: null } },
                { $set: values, $unset: { deletedAt: '' } },
                { returnDocument: 'after', runValidators: true }
            )
            if (!category) category = await Categories.findOne({ ...match, deletedAt: null })
            if (!category) throw err
            return res.status(200).json(category)
        }
        return res.status(201).json(category)
    } catch (err){
        if (err.name === 'ValidationError' || err.name === 'CastError') {
            return res.status(400).json({message: err.message})
        }
        return res.status(500).json({message: err.message})
    }
})

router.put('/categories/:id', protect, async (req, res) => {
    try {
        const category = await Categories.findOne({ _id: req.params.id, user: req.user._id, deletedAt: null })
        if (!category) return res.status(404).json({ message: 'Category not found.' })

        const { categName, categType, categBudget, subcategories } = req.body || {}
        if (categName !== undefined) {
            if (typeof categName !== 'string' || !categName.trim()) {
                return res.status(400).json({ message: 'Enter a category name.' })
            }
            category.categName = categName.trim()
        }
        if (categType !== undefined) {
            if (!['expense', 'income'].includes(categType)) {
                return res.status(400).json({ message: 'Choose Expense or Income.' })
            }
            if (category.templateKey && categType !== category.categType) {
                return res.status(400).json({ message: 'A built-in category cannot change between Expense and Income.' })
            }
            if (categType !== category.categType && await Transaction.exists({ user: req.user._id, category: category._id })) {
                return res.status(400).json({ message: 'A category with saved transactions cannot change between Expense and Income.' })
            }
            category.categType = categType
        }
        if (categBudget !== undefined) {
            const budget = Number(categBudget === '' || categBudget === null ? 0 : categBudget)
            if (!Number.isFinite(budget) || budget < 0) {
                return res.status(400).json({ message: 'Category budget must be zero or more.' })
            }
            category.categBudget = budget
        }
        if (subcategories !== undefined) {
            const cleanSubcategories = normalizeSubcategories(subcategories)
            if (!cleanSubcategories) return res.status(400).json({ message: 'Subcategories must be a list of names.' })
            category.subcategories = cleanSubcategories
        }

        await category.save()
        return res.status(200).json(category)
    } catch (err) {
        if (err.name === 'ValidationError' || err.name === 'CastError') {
            return res.status(400).json({ message: err.message })
        }
        return res.status(500).json({ message: err.message })
    }
})

router.delete('/categories/:id', protect, async (req, res) => {
    try {
        const category = await Categories.findOne({ _id: req.params.id, user: req.user._id, deletedAt: null })
        if (!category) return res.status(404).json({ message: 'Category not found.' })

        category.deletedAt = new Date()
        await category.save()
        return res.status(200).json({ message: 'Category deleted.' })
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid category.' })
        }
        return res.status(500).json({ message: err.message })
    }
})

export default router
