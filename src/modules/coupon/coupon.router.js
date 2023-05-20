import { Router } from "express";
import auth from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { asyncHandler } from "../../utils/errorHandling.js";
const router = Router()

import * as controllers from './coupon.controller.js'
import { endPoints } from "./coupon.endPoint.js";
import * as validators from "./coupon.validation.js";


router.post('/', auth(endPoints.CREAT_COUPON), validation(validators.createCouponSchema), asyncHandler(controllers.createCoupon))
router.put('/:couponId', auth(endPoints.UPDATE_COUPON), validation(validators.updateCouponSchema), asyncHandler(controllers.updateCoupon))


export default router