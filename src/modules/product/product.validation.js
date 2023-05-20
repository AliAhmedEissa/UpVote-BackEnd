import Joi from "joi";
import { generalFields } from "../../middleware/validation.js";

// file: {
//     mainImage: [{}],
//         subImage: [{}],
// }

// Colors array not accept one item
export const addProductSchema = Joi.object({
    // authorization: Joi.string().required(),

    name: Joi.string().min(4).max(13).alphanum().required(),
    description: Joi.string().min(20).max(130000).alphanum().optional(),
    stock: Joi.number().integer().positive().optional(),
    price: Joi.number().positive().required(),
    discount: Joi.number().positive().optional(),
    colors: Joi.array().items(Joi.string().required()).optional(),
    size: Joi.array().items(Joi.string().optional()).optional(),
    categoryId: generalFields.id,
    subCategoryId: generalFields.id,
    brandId: generalFields.id,
    file: Joi.object({
        mainImage: Joi.array().items(generalFields.file.required()).required(),
        subImages: Joi.array().items(generalFields.file.required()).optional(),
    }).required()

}).required()
// .options({ allowUnknown: true })

export const Headers = Joi.object({
    authorization: Joi.string().required(),

}).required()
// .options({ allowUnknown: true })