import mongoose from 'mongoose'

const categoriesSchema = new mongoose.Schema({
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
        required: true
    }
})

const Categories =  mongoose.model("Category", categoriesSchema)

export default Categories