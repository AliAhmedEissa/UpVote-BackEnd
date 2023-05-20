import { Router } from "express";
import auth from "../../middleware/auth.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { addToCart } from "./cart.controller.js";
const router = Router()




router.get('/', (req, res) => {
    res.status(200).json({ message: "Cart Module" })
})



router.post('/', auth(), asyncHandler(addToCart))

export default router