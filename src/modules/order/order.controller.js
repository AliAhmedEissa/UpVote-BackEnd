import cartModel from '../../../DB/model/Cart.model.js'
import couponModel from '../../../DB/model/Coupon.model.js'
import orderModel from '../../../DB/model/Order.model.js'
import productModel from '../../../DB/model/Product.model.js'
import { createInvoice } from '../../utils/pdfkit.js'
import { validationCoupon } from '../coupon/coupon.controller.js'
import sendEmail from '../../utils/sendEmail.js'
import { payment } from '../../utils/payment.js'
import Stripe from 'stripe'

export const createOrder = async (req, res, next) => {
  const userId = req.user._id
  const { products, couponCode, address, phone, paymentMethod } = req.body
  // coupon validation
  if (couponCode) {
    const coupon = await couponModel.findOne({ code: couponCode })
    if (!coupon) {
      return next(new Error('in-valid coupon code', { cause: 400 }))
    }
    const { matched, exceed, expired } = validationCoupon(coupon, userId)

    if (expired) {
      return next(new Error('this coupon is expired', { cause: 400 }))
    }
    if (!matched) {
      return next(
        new Error('this coupon isnot assgined to you', { cause: 400 }),
      )
    }
    if (exceed) {
      return next(
        new Error('you exceed the max usage of this coupon', { cause: 400 }),
      )
    }
    req.body.coupon = coupon
  }

  if (!products?.length) {
    const cartExist = await cartModel.findOne({ userId })
    if (!cartExist?.products?.length) {
      return next(new Error('empty cart', { cause: 400 }))
    }
    req.body.isCart = true
    req.body.products = cartExist.products
  }
  // products validation
  // [{ productId , quantity}]
  let subTotal = 0
  let finalProducts = []
  let productIds = []
  for (let product of req.body.products) {
    productIds.push(product.productId)
    const findProduct = await productModel.findOne({
      _id: product.productId,
      stock: { $gte: product.quantity },
      isDeleted: false,
    })
    if (!findProduct) {
      return next(new Error('invalid product', { cause: 400 }))
    }
    if (req.body.isCart) {
      product = product.toObject()
    }
    product.name = findProduct.name
    product.productPrice = findProduct.priceAfterDiscount
    product.finalPrice = Number.parseFloat(
      findProduct.priceAfterDiscount * product.quantity,
    ).toFixed(2)
    finalProducts.push(product)
    subTotal += parseInt(product.finalPrice)
  }

  paymentMethod == 'cash'
    ? (req.body.orderStatus = 'placed')
    : (req.body.orderStatus = 'pending')

  const orderObject = {
    userId,
    products: finalProducts,
    address,
    phone,
    paymentMethod,
    orderStatus: req.body.orderStatus,
    subTotal,
    couponId: req.body.coupon?._id,
    totalPrice: Number.parseFloat(
      subTotal * (1 - (req.body.coupon?.amount || 0) / 100),
    ).toFixed(2),
  }

  const order = await orderModel.create(orderObject)
  if (order) {
    let session = {}
    if (order.paymentMethod == 'card') {
      if (req.body.coupon) {
        const stripe = new Stripe(process.env.STRIP_SECRET_KEY)
        const coupon = await stripe.coupons.create({
          percent_off: req.body.coupon.amount,
        })
        req.body.couponId = coupon.id
      }
      session = await payment({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: req.user.email,
        metadata: {
          orderId: order._id.toString(),
        },
        cancel_url: `${process.env.CANCEL_URL}?orderId=${order._id}`,
        success_url: `${process.env.SUCCESS_URL}?orderId=${order._id}`,
        discounts: req.body.couponId ? [{ coupon: req.body.couponId }] : [],
        line_items: order.products.map((pro) => {
          return {
            price_data: {
              currency: 'EGP',
              product_data: {
                name: pro.name,
              },
              unit_amount: pro.productPrice,
            },
            quantity: pro.quantity,
          }
        }),
      })
    }
    // increement usageCount => 1
    if (req.body.coupon) {
      for (const user of req.body.coupon?.usagePerUser) {
        if (user.userId.toString() == userId.toString()) {
          user.usageCount += 1
        }
      }
      await req.body.coupon.save()
    }
    // decrement stock => quantity
    for (const product of req.body.products) {
      await productModel.findByIdAndUpdate(product.productId, {
        $inc: { stock: -parseInt(product.quantity) },
      })
    }
    // remove product from cart
    await cartModel.updateOne(
      { userId },
      {
        $pull: { products: { productId: { $in: productIds } } },
      },
    )
    // generate pdf
    // const invoice = {
    //   shipping: {
    //     name: req.user.userName,
    //     address: order.address,
    //     city: 'Cairo',
    //     state: 'Cairo',
    //     country: 'Egypt',
    //     postal_code: 94111,
    //   },
    //   items: order.products,
    //   subtotal: order.subTotal,
    //   paid: order.totalPrice,
    //   invoice_nr: order._id,
    //   date: order.createdAt,
    // }

    // await createInvoice(invoice, 'invoice.pdf')
    // await sendEmail({
    //   to: req.user.email,
    //   message: 'please check your order invoice',
    //   subject: 'Order Invoice',
    //   attachments: [{ path: 'invoice.pdf' }],
    // })
    res.status(201).json({ message: 'Done', order, session })
  }
}

export const cancelOrder = async (req, res, next) => {
  const { orderId } = req.params
  const { reason } = req.body
  const order = await orderModel.findById(orderId)
  if (
    (order?.orderStatus != 'placed' && order?.paymentMethod == 'cash') ||
    (!['confirmed', 'pending'].includes(order?.orderStatus) &&
      order?.paymentMethod == 'card')
  ) {
    return next(
      new Error(
        `you canot cancell this order with status ${order.orderStatus}`,
        { cause: 400 },
      ),
    )
  }
  order.orderStatus = 'cancelled'
  order.reason = reason
  order.upadtedBy = req.user._id
  const orderCancelled = await order.save()
  if (orderCancelled) {
    if (order.couponId) {
      const coupon = await couponModel.findById(order.couponId)
      for (const user of coupon?.usagePerUser) {
        if (user.userId.toString() == order.userId.toString()) {
          user.usageCount -= 1
        }
      }
      await coupon.save()
    }
    // decrement stock => quantity
    for (const product of order.products) {
      await productModel.findByIdAndUpdate(product.productId, {
        $inc: { stock: parseInt(product.quantity) },
      })
    }
    res.status(200).json({ message: 'order cancelled succesfully' })
  }
}

export const webHook = async (req, res, next) => {
  const stripe = new Stripe(process.env.STRIP_SECRET_KEY)
  const endpointSecret = 'whsec_uCbGwtPv8ZR7lCiFoJIYkil53mWznLDB'

  const sig = req.headers['stripe-signature']

  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`)
    return
  }
  const { orderId } = event.data.object.metadata
  if (event.type == 'checkout.session.completed') {
    await orderModel.findByIdAndUpdate(orderId, {
      orderStatus: 'confirmed',
    })
    return res.status(200).json({ message: 'Payment successed' })
  }
  await orderModel.findByIdAndUpdate(orderId, {
    orderStatus: 'payment failed',
  })
  return res.status(200).json({ message: 'Payment failed' })
}

// {
//   "id": "evt_1N1ugkKK3qD4Euati00qmlfs",
//   "object": "event",
//   "api_version": "2022-11-15",
//   "created": 1682701350,
//   "data": {
//     "object": {
//       "id": "cs_test_b1VLjrCqzFCTosB1ubqbIFY6UF76xW2aUGnGpvytcdtCeNX6lAbdQ4PIfN",
//       "object": "checkout.session",
//       "after_expiration": null,
//       "allow_promotion_codes": null,
//       "amount_subtotal": 140000,
//       "amount_total": 140000,
//       "automatic_tax": {
//         "enabled": false,
//         "status": null
//       },
//       "billing_address_collection": null,
//       "cancel_url": "http://localhost:3000/cancel?orderId=644bfc0db6896e496c1da46c",
//       "client_reference_id": null,
//       "consent": null,
//       "consent_collection": null,
//       "created": 1682701327,
//       "currency": "egp",
//       "currency_conversion": null,
//       "custom_fields": [
//       ],
//       "custom_text": {
//         "shipping_address": null,
//         "submit": null
//       },
//       "customer": null,
//       "customer_creation": "if_required",
//       "customer_details": {
//         "address": {
//           "city": null,
//           "country": "EG",
//           "line1": null,
//           "line2": null,
//           "postal_code": null,
//           "state": null
//         },
//         "email": "amiraezaatroute4@gmail.com",
//         "name": "amira ezaat ewis",
//         "phone": null,
//         "tax_exempt": "none",
//         "tax_ids": [
//         ]
//       },
//       "customer_email": "amiraezaatroute4@gmail.com",
//       "expires_at": 1682787726,
//       "invoice": null,
//       "invoice_creation": {
//         "enabled": false,
//         "invoice_data": {
//           "account_tax_ids": null,
//           "custom_fields": null,
//           "description": null,
//           "footer": null,
//           "metadata": {
//           },
//           "rendering_options": null
//         }
//       },
//       "livemode": false,
//       "locale": null,
//       "metadata": {
//         "orderId": "644bfc0db6896e496c1da46c"
//       },
//       "mode": "payment",
//       "payment_intent": "pi_3N1ugjKK3qD4Euat1cG6743U",
//       "payment_link": null,
//       "payment_method_collection": "always",
//       "payment_method_options": {
//       },
//       "payment_method_types": [
//         "card"
//       ],
//       "payment_status": "paid",
//       "phone_number_collection": {
//         "enabled": false
//       },
//       "recovered_from": null,
//       "setup_intent": null,
//       "shipping_address_collection": null,
//       "shipping_cost": null,
//       "shipping_details": null,
//       "shipping_options": [
//       ],
//       "status": "complete",
//       "submit_type": null,
//       "subscription": null,
//       "success_url": "http://localhost:3000/success?orderId=644bfc0db6896e496c1da46c",
//       "total_details": {
//         "amount_discount": 0,
//         "amount_shipping": 0,
//         "amount_tax": 0
//       },
//       "url": null
//     }
//   },
//   "livemode": false,
//   "pending_webhooks": 4,
//   "request": {
//     "id": null,
//     "idempotency_key": null
//   },
//   "type": "checkout.session.completed"
// }
