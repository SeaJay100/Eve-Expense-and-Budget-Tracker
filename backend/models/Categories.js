import mongoose from 'mongoose';

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
        required: true,
        trim: true
    },
    categType: {
        type: String,
        required: true,
        enum: ['expense', 'income']
    },
    categBudget: {
        type: Number,
        default: 0,
        min: 0,
        validate: { validator: value => Number.isFinite(value), message: 'Category budget must be a finite number.' }
    },
    templateKey: {
        type: String,
        default: null,
        trim: true
    },
    subcategories: {
        type: [{ type: String, trim: true }],
        default: []
    },
    deletedAt: Date
});

categoriesSchema.index(
    { user: 1, templateKey: 1 },
    { unique: true, partialFilterExpression: { templateKey: { $type: 'string' } } }
);

const Categories = mongoose.model('Category', categoriesSchema);

export default Categories;
