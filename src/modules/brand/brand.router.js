import { Router } from "express";
import auth from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { fileUpload } from "../../utils/multer.js";
import * as controllers from './brand.controller.js'
import { endPoints } from "./brand.endPoint.js";
import * as validators from "./brand.validation.js";
const router = Router({ mergeParams: true })


router.post('/add',
    auth(endPoints.CREAT_BRAND),
    fileUpload({}).single('logo'),
    validation(validators.addBrandSchema),
    asyncHandler(controllers.addBrand)
)

export default router