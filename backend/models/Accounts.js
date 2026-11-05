import mongoose from 'mongoose'

const accountSchema = new mongoose.Schema({
    accName: {
        type: String,
        required: true
    } ,
    accAmount: {
        type: Number,
        required: true
    },
    accType: {
        type: String,
        required: true
    }
})

const Account =  mongoose.model("Account", accountSchema)

export default Account