import { Router } from 'express'
import { validation } from '../../middleware/validation.js'
import auth from '../../middleware/auth.js'
import * as controllers from './order.controller.js'
import { endPoints } from './order.endPoint.js'
import { asyncHandler } from '../../utils/errorHandling.js'
import { cancelOrder, createOrder } from './order.validation.js'
import express from 'express'
const router = Router()

router.post(
  '/',
  auth(endPoints.CREAT_ORDER),
  validation(createOrder),
  asyncHandler(controllers.createOrder),
)
router.patch(
  '/:orderId',
  auth(endPoints.CACNCEL_ORDER),
  validation(cancelOrder),
  asyncHandler(controllers.cancelOrder),
)

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  asyncHandler(controllers.webHook),
)
export default router
