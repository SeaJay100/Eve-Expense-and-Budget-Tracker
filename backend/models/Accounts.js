import mongoose from 'mongoose'

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
    } ,
    accAmount: {
        type: Number,
        required: true,
        validate: { validator: value => Number.isFinite(value) && value !== 0, message: 'Account balance must be a finite, non-zero number.' }
    },
    accType: {
        type: String,
        required: true
    }
})

const Account =  mongoose.model("Account", accountSchema)

export default Account
