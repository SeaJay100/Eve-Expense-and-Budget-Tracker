import mongoose from "mongoose"

const transactionSchema = new mongoose.Schema({
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String
    },
    date: {
        type: Date,
        required: true
    },
    account: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    }
})

const Transaction = mongoose.model("Transaction", transactionSchema)

export default Transaction