import mongoose from 'mongoose'

const categoriesSchema = new mongoose.Schema({
    // The User ID of the person who owns this category.
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    categName: {
        type: String,
        required: true
    },
    categType: {
        type: String,
        required: true
    },
    categBudget: {
        type: Number,
        required: true,
        validate: { validator: value => Number.isFinite(value) && value !== 0, message: 'Category budget must be a finite, non-zero number.' }
    }
})

const Categories =  mongoose.model("Category", categoriesSchema)

export default Categories
