import mongoose, { Types } from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    products: [
      {
        productId: {
          type: Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        name: { type: String, required: true },
        productPrice: { type: Number, required: true },
        finalPrice: { type: Number, required: true },
      },
    ],
    address: { type: String, required: true },
    phone: { type: [String], required: true },
    subTotal: { type: Number, required: true, default: 1 },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    totalPrice: {
      type: Number,
      default: 1,
    },
    paymentMethod: {
      type: String,
      default: 'cash',
      enum: ['cash', 'card'],
    },
    orderStatus: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'placed',
        'on way',
        'deliverd',
        'cancelled',
        'rejected',
        'payment failed',
      ],
    },
    reason: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
)

const orderModel = mongoose.models.Order || mongoose.model('Order', orderSchema)

export default orderModel
