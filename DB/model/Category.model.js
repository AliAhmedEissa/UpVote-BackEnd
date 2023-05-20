import mongoose from "mongoose"

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    Image: {
        path: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        },
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    customId: String

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
})

// subCategories
categorySchema.virtual('SubCategories', {
    ref: 'subCategory',
    localField: '_id',
    foreignField: 'categoryId',
    // justOne:true
})

const categoryModel = mongoose.models.Category || mongoose.model('Category', categorySchema)

export default categoryModel
