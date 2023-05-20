import Joi from "joi";
import { generalFields } from "../../middleware/validation.js";


export const addBrandSchema = Joi.object({
    name: Joi.string().required().max(30).min(4).required(),
    file: generalFields.file.required(),
    categoryId: Joi.string().required(),
    subCategoryId: Joi.string().required(),
}).required()