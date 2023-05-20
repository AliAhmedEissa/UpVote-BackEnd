import Stripe from 'stripe'

export function payment({
  payment_method_types = ['card'],
  mode = 'payment',
  customer_email = '',
  metadata = {},
  cancel_url = process.env.CANCEL_URL,
  success_url = process.env.SUCCESS_URL,
  discounts = [],
  line_items = [],
} = {}) {
  const stripe = new Stripe(process.env.STRIP_SECRET_KEY)
  const session = stripe.checkout.sessions.create({
    payment_method_types,
    mode,
    customer_email,
    metadata,
    cancel_url,
    success_url,
    discounts,
    line_items,
  })
  return session
}

//   {
// price_data: {
//     currency,
//     product_data: {
//       name,
//     },
//     unit_amount,
//   },
//   quantity,
// },
