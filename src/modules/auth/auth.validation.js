import Joi from "joi";
import { generalFields } from "../../middleware/validation.js";


export const signUpSchema = Joi.object({
    userName: Joi.string().max(20).min(5).required().alphanum(),
    email: generalFields.email,
    password: generalFields.password,
    cPass: generalFields.cPassword,
    phone: Joi.string().required(),
    DOB: Joi.string().optional()
}).required()



export const logInSchema = Joi.object({
    email: generalFields.email,
    password: generalFields.password,
   
}).required()