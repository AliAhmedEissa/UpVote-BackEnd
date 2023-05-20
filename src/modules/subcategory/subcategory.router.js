import { Router } from "express";
import auth from "../../middleware/auth.js";
import { validation } from "../../middleware/validation.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { fileUpload } from "../../utils/multer.js";
const router = Router({ mergeParams: true })


import * as controllers from './subCategory.controller.js'
import { endPoints } from "./subcategory.endPoint.js";
import * as validators from './subcategory.validation.js'


router.post('/add',
    auth(endPoints.CREAT_SUB_CATEGORY),
    fileUpload({}).single('image'),
    // validation(validators.createSubCategorySchema),
    asyncHandler(controllers.createSubCategory))

router.put('/:subCategoryId',
    auth(endPoints.UPDATE_SUB_CATEGORY),
    fileUpload({}).single('image'),
    validation(validators.updateSubCategorySchema),
    asyncHandler(controllers.updateSubCategory))

export default router


// category => /:categoryd/subCategory/  ==> subCategoryRouter