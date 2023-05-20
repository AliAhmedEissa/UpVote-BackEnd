import cartModel from "../../../DB/model/Cart.model.js"
import productModel from "../../../DB/model/Product.model.js"

export const addToCart = async (req, res, next) => {
    const userId = req.user._id
    const { productId, quantity } = req.body
    // product
    const product = await productModel.findById(productId)
    if (!product) {
        return next(new Error('in-valid pricustID', { cause: 400 }))
    }
    if (product.stock < quantity || product.isDeleted) {
        await productModel.findByIdAndUpdate(productId, {
            $addToSet: {
                userAddToWishList: userId
            }
        })
        return next(new Error('not available', { cause: 400 }))
    }
    // userId
    const cart = await cartModel.findOne({ userId })
    if (!cart) {
        const savedCart = await cartModel.create({
            userId,
            products: [{ productId, quantity }]
        })
        return res.status(201).json({ messages: "Done", savedCart })
    }

    // update exist product 
    let isProductExist = false;
    for (const product of cart.products) {
        if (product.productId.toString() == productId) {
            product.quantity = quantity
            isProductExist = true
            break
        }
    }

    // add new product
    if (!isProductExist) {
        cart.products.push({ productId, quantity })
    }
    await cart.save()
    res.status(200).json({ message: "Done", cart })
}