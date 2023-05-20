


import joi from "joi"
import { generalFields } from "../../middleware/validation.js"
export const createCategorySchema = joi.object({
    name: joi.string().required().max(30).min(4),
    // file: joi.array().items(generalFields.file.required()).required()
    file: generalFields.file.required()
}).required()


export const updateCategorySchema = joi.object({
    name: joi.string().required().max(30).min(4).optional(),
    // file: joi.array().items(generalFields.file.required()).required()
    file: generalFields.file.optional(),
    categoryId: joi.string().required()
}).required()
