import mongoose from "mongoose"

const transactionSchema = new mongoose.Schema({
    // The User ID of the person who owns this transaction.
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['expense', 'income'],
        default: 'expense'
    },
    amount: {
        type: Number,
        required: true,
        validate: { validator: value => Number.isFinite(value) && value > 0, message: 'Transaction amount must be greater than zero.' }
    },
    description: {
        type: String
    },
    date: {
        type: Date,
        required: true
    },
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }
})

const Transaction = mongoose.model("Transaction", transactionSchema)

export default Transaction
