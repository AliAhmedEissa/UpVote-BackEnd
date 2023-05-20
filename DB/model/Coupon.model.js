

import mongoose from "mongoose"

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        unique: true,
        required: true
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
    amount: {
        type: Number,
        required: true,
        default: 1
    }, // expiration 
    fromDate: {
        type: String,
        required: true
    },
    toDate: {
        type: String,
        required: true
    },
    couponStatus: {
        type: String,
        required: true,
        default: "Valid",
        enum: ['Valid', 'expired']
    },
    usagePerUser: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            maxUsage: {
                type: Number,
                required: true
            },
            usageCount: {
                type: Number,
                default: 0
            }
        }
    ]
}, {
    timestamps: true
})


const couponModel = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema)

export default couponModel
