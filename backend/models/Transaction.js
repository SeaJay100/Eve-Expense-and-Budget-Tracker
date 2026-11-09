import mongoose from 'mongoose';

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
        enum: ['expense', 'income', 'transfer', 'adjustment'],
        default: 'expense'
    },
    adjustmentDirection: {
        type: String,
        enum: ['increase', 'decrease'],
        required: function() { return this.type === 'adjustment'; }
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
        required: function() { return this.type === 'expense' || this.type === 'income'; }
    },
    otherAccount: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account'
    },
    fee: {
        type: Number,
        default: 0,
        validate: { validator: value => Number.isFinite(value) && value >= 0, message: 'Transfer fee must be zero or greater.' }
    },
    recurring: {
        type: Boolean,
        default: false
    },
    recurringSyncVersion: {
        type: Number,
        select: false
    },
    recurringFrom: Date,
    recurringSource: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction'
    },
    occurrenceDate: Date,
    occurrenceMonth: Date,
    skippedDates: [Date],
    deletedAt: Date
});

transactionSchema.index(
    { user: 1, recurringSource: 1, occurrenceMonth: 1 },
    { unique: true, partialFilterExpression: { recurringSource: { $exists: true } } }
);

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
