
import mongoose, { Types } from "mongoose"

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true
    },
    products: [
        {
            productId: {
                type: Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ]

}, {
    timestamps: true
})


const cartModel = mongoose.models.cart || mongoose.model('cart', cartSchema)

export default cartModel
