
import mongoose from "mongoose"

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    subCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subCategory",
        required: true
    },
    logo: {
        path: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    },
    customId: String

}, {
    timestamps: true
})


const brandModel = mongoose.models.Brand || mongoose.model('Brand', brandSchema)

export default brandModel
