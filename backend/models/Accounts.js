import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
    // The User ID of the person who owns this account.
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    accName: {
        type: String,
        trim: true,
        required: true
    },
    accAmount: {
        type: Number,
        required: true,
        default: 0,
        validate: { validator: Number.isFinite, message: 'Account balance must be a finite number.' }
    },
    balanceRevision: {
        type: Number,
        default: 0
    },
    accType: {
        type: String,
        required: true,
        trim: true
    },
    accClass: {
        type: String,
        enum: ['asset', 'liability'],
        default: 'asset'
    },
    accIcon: {
        type: String,
        trim: true,
        maxlength: 8
    },
    accNote: {
        type: String,
        trim: true,
        maxlength: 120
    },
    archivedAt: Date
});

const Account = mongoose.model('Account', accountSchema);

export default Account;
