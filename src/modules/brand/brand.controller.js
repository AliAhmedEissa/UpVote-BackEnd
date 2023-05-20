import { nanoid } from "nanoid"
import brandModel from "../../../DB/model/Brand.model.js"
import categoryModel from "../../../DB/model/Category.model.js"
import subCategoryModel from "../../../DB/model/Subcategory.model.js"
import cloudinary from "../../utils/cloudinary.js"

export const addBrand = async (req, res, next) => {
    const { name, } = req.body
    const { subCategoryId, categoryId } = req.params
    const catergory = await categoryModel.findOne({ _id: categoryId })
    const subCategory = await subCategoryModel.findOne({ _id: subCategoryId, categoryId })
    if (!subCategory) {
        return next(new Error('in-valid sub-category', { cause: 400 }))
    }
    if (await brandModel.findOne({ name, subCategoryId })) {

        return next(new Error('this brand already added to this subCategory', { cause: 400 }))
    }
    const customId = nanoid(5)
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: `${process.env.PROJECT_FOLDER}/Categories/${catergory.customId}/SubCatgories/${subCategory.customId}/Brands/${customId}`
    })
    const brand = await brandModel.create({
        name,
        logo: {
            path: secure_url,
            public_id
        },
        customId,
        subCategoryId,
        createdBy: req.user._id
    })
    if (!brand) {
        await cloudinary.uploader.destroy(public_id)
        return next(new Error('please try to add brand after 5 mins', { cause: 400 }))
    }
    return res.status(201).json({ message: "Done" })
}