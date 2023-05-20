import mongoose from "mongoose"

const subCategorySchema = new mongoose.Schema({
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
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    slug: {
        type: String,
        required: true
    },
    customId: String,
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
    },

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
})

// Brands
subCategorySchema.virtual('brands', {
    ref: 'Brand',
    localField: '_id',
    foreignField: 'subCategoryId',
    // justOne:true
})


const subCategoryModel = mongoose.models.subCategory || mongoose.model('subCategory', subCategorySchema)

export default subCategoryModel



