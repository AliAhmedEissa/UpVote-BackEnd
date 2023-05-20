import mongoose, { Schema, model } from 'mongoose'
import pkg from 'bcryptjs'
import { systemRoles } from '../../src/utils/systemRoles.js'

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: [true, 'userName is required'],
      min: [2, 'minimum length 2 char'],
      max: [20, 'max length 2 char'],
    },
    email: {
      type: String,
      unique: [true, 'email must be unique value'],
      required: [true, 'userName is required'],
    },
    password: {
      type: String,
      required: [true, 'password is required'],
    },
    phone: {
      type: String,
    },
    role: {
      type: String,
      default: systemRoles.USER,
      enum: [systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    isConfirmed: {
      type: Boolean,
      default: false,
    },
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    image: String,
    DOB: String,
    forgetCode: String,
    changePassword: Number,
    provider: {
      type: String,
      default: 'System',
      enum: ['System', 'GOOGLE', 'facebook'],
    },
  },
  {
    timestamps: true,
  },
)

userSchema.pre('save', function (next, doc) {
  this.password = pkg.hashSync(this.password, +process.env.SALT_ROUNDS)
  next()
})

const userModel = mongoose.models.User || model('User', userSchema)
export default userModel
