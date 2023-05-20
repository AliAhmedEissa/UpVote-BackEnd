import joi from "joi"
import { generalFields } from "../../middleware/validation.js"
export const createSubCategorySchema = joi.object({
    name: joi.string().required().max(30).min(4),
    // file: joi.array().items(generalFields.file.required()).required()
    file: generalFields.file.required(),
    categoryId: joi.string()
}).required()



export const updateSubCategorySchema = joi.object({
    name: joi.string().required().max(30).min(4).optional(),
    // file: joi.array().items(generalFields.file.required()).required()
    file: generalFields.file.optional(),
    subCategoryId: joi.string().required(),
    categoryId: joi.string().required()
}).required()
