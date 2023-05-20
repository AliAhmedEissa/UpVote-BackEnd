import { Router } from "express";
import { validation } from "../../middleware/validation.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { fileUpload } from "../../utils/multer.js";
import * as controllers from './category.controller.js'
import * as validators from './category.validation.js'
import subCategoryRouter from '../subcategory/subcategory.router.js'
import brandRouter from '../brand/brand.router.js'
import auth from "../../middleware/auth.js";
import { endPoints } from "./category.endPoint.js";
const router = Router({ caseSensitive: true })

router.use('/:categoryId/subCategory', subCategoryRouter)
router.use('/:categoryId/:subCategoryId/brand', brandRouter)

router.post('/',
    auth(endPoints.CREAT_CATEGORY),
    fileUpload({}).single('image'),
    validation(validators.createCategorySchema),
    asyncHandler(controllers.createCategory))

router.put('/:categoryId',
    auth(endPoints.UPDATE_CATEGORY),
    fileUpload({}).single('image'),
    validation(validators.updateCategorySchema),
    asyncHandler(controllers.updateCategory))



router.get('/', asyncHandler(controllers.getllCategories))

export default router