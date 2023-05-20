import { nanoid } from "nanoid"
import slugify from "slugify"
import categoryModel from "../../../DB/model/Category.model.js"
import subCategoryModel from "../../../DB/model/Subcategory.model.js"
import cloudinary from "../../utils/cloudinary.js"


export const createSubCategory = async (req, res, next) => {
    const data = {
        ...req.body,
        ...req.params,
        ...req.query,
        ...req.headers
    }
    if (req.file) data.file = req.file
     ({ data });
    const { categoryId } = data
    //  ({ categoryId });
    const { name } = data
    const slug = slugify(name, '_')
    const category = await categoryModel.findById(categoryId)
    if (!category) {
        return res.status(404).json({ message: `in-valid category ID` })
    }
    if (await subCategoryModel.findOne({ name })) {
        return res.status(400).json({ message: "please enter different subCategory name" })
    }
    const customId = nanoid(5)
    const { secure_url, public_id } = await cloudinary.uploader.upload(data.file.path, {
        folder: `${process.env.PROJECT_FOLDER}/Categories/${category.customId}/SubCatgories/${customId}`
    })
    const subCategory = await subCategoryModel.create({
        name,
        slug,
        Image: {
            path: secure_url,
            public_id
        },
        customId,
        categoryId,
        createdBy: req.user._id
    })
    if (!subCategory) {
        await cloudinary.uploader.destroy(public_id)
        return res.status(400).json({ message: "Fail to add subCategory, please try again later" })
    }
    return res.status(201).json({ message: `subCategory ${name} Added successfully` })
}

export const updateSubCategory = async (req, res, next) => {
    const { subCategoryId, categoryId } = req.params
    const category = await categoryModel.findById(categoryId)
    const subCategory = await subCategoryModel.findOne({ _id: subCategoryId, categoryId: categoryId })
    if (!subCategory) {
        return next(new Error('SubCategory not found', { cause: 404 }))
    }
    if (req.body.name) {
        if (subCategory.name == req.body.name) {
            return next(new Error('please enter different categotry name', { cause: 400 }))
        }
        if (await subCategoryModel.findOne({ name: req.body.name })) {
            return next(new Error('Category name already exist', { cause: 400 }))
        }
        subCategory.name = req.body.name
        subCategory.slug = slugify(req.body.name, '_')
    }
    if (req.file) {
        await cloudinary.uploader.destroy(subCategory.Image.public_id)
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path,
            {
                folder: `${process.env.PROJECT_FOLDER}/Categories/${category.customId}/SubCatgories/${subCategory.customId}`
            })
        subCategory.Image = {
            path: secure_url,
            public_id
        }
    }
    if (!Object.keys(req.body).length && !req.file) {
        return next(new Error('please enter the updated fields', { cause: 400 }))
    }
    subCategory.updatedBy = req.user._id
    const savedCat = await subCategory.save()
    return res.status(200).json({ mesaage: "Done", savedCat })
}

