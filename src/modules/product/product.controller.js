import { nanoid } from 'nanoid'
import slugify from 'slugify'
import brandModel from '../../../DB/model/Brand.model.js'
import categoryModel from '../../../DB/model/Category.model.js'
import productModel from '../../../DB/model/Product.model.js'
import subCategoryModel from '../../../DB/model/Subcategory.model.js'
import cloudinary from '../../utils/cloudinary.js'
import ApiFetaures from '../../utils/apiFeatures.js'

export const adProduct = async (req, res, next) => {
  // IDs
  const { categoryId, subCategoryId, brandId, name, price, discount } = req.body
  const Category = await categoryModel.findById(categoryId)
  const subCategory = await subCategoryModel.findOne({
    _id: subCategoryId,
    categoryId,
  })
  const brand = await brandModel.findOne({ _id: brandId, subCategoryId })
  if (!Category || !subCategory || !brand) {
    return next(new Error('in-valid ids', { cause: 400 }))
  }
  createdBy
  req.body.createdBy = req.user._id
  // name
  req.body.slug = slugify(name, {
    replacment: '_',
    lower: true,
  })

  // prices
  // 500 * (1 - 0.25) =375
  req.body.priceAfterDiscount = price * (1 - (discount || 0) / 100)

  // Images => { mainImage:[{}]  , subImages:[{}, {}]}
  //  (req.files)
  // mainIamge
  const customId = nanoid(5)
  req.body.customId = customId
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.mainImage[0].path,
    {
      folder: `${process.env.PROJECT_FOLDER}/Categories/${Category.customId}/SubCatgories/${subCategory.customId}/Brands/${brand.customId}/Products/${customId}`,
    },
  )
  req.body.mainImage = {
    path: secure_url,
    public_id,
  }
  // subImages
  if (req.files.subImages) {
    req.body.subImgaes = []
    for (const file of req.files.subImages) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `${process.env.PROJECT_FOLDER}/Categories/${Category.customId}/SubCatgories/${subCategory.customId}/Brands/${brand.customId}/Products/${customId}`,
        },
      )
      req.body.subImgaes.push({
        path: secure_url,
        public_id,
      })
    }
  }

  const product = await productModel.create(req.body)
  if (!product) {
    // destory, assginment
    return next(new Error('fail', { cause: 500 }))
  }
  return res.status(201).json({ message: 'Done', product })
}

export const updateProduct = async (req, res, next) => {
  const { productId } = req.params
  const product = await productModel.findById(productId)
  if (!product) {
    return next(new Error('in-valid procustId', { cause: 400 }))
  }
  const { name, price, discount } = req.body
  //name
  if (name) {
    req.body.slug = slugify(name, {
      replacment: '_',
      lower: true,
    })
  }

  // price
  if (price && discount) {
    req.body.priceAfterDiscount = price * (1 - discount / 100)
    // } else if (price) {
    //     req.body.priceAfterDiscount = price * (1 - ((product.discount) / 100))
    // } else if (discount) {
    //     req.body.priceAfterDiscount = product.price * (1 - ((discount) / 100))
    // }
  } else if (price || discount) {
    req.body.priceAfterDiscount =
      (price || product.price) * (1 - (discount || product.discount) / 100)
  }
  const Category = await categoryModel.findById(product.categoryId)
  const subCategory = await subCategoryModel.findOne({
    _id: product.subCategoryId,
    categoryId: product.categoryId,
  })
  const brand = await brandModel.findOne({
    _id: product.brandId,
    subCategoryId: product.subCategoryId,
  })
  // mainImage
  if (req.files?.mainImage?.length) {
    await cloudinary.uploader.destroy(product.mainImage.public_id)
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files.mainImage[0].path,
      {
        folder: `${process.env.PROJECT_FOLDER}/Categories/${Category.customId}/SubCatgories/${subCategory.customId}/Brands/${brand.customId}/Products/${product.customId}`,
      },
    )
    req.body.mainImage = {
      path: secure_url,
      public_id,
    }
  }

  // subImages
  if (req.files?.subImages?.length) {
    req.body.subImgaes = []
    for (const file of req.files.subImages) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `${process.env.PROJECT_FOLDER}/Categories/${Category.customId}/SubCatgories/${subCategory.customId}/Brands/${brand.customId}/Products/${product.customId}`,
        },
      )
      req.body.subImgaes.push({
        path: secure_url,
        public_id,
      })
    }
  }

  req.body.updatedBy = req.user._id
  const savedProduct = await productModel.findByIdAndUpdate(
    productId,
    req.body,
    { new: true },
  )
  if (!savedProduct) {
    return next(new Error('in-valid procustId fail to update', { cause: 400 }))
  }
  res.status(200).json({ message: 'Done', savedProduct })
}

//  sort,search,filter,pagination,fields
export const productList = async (req, res, next) => {
  // class
  const apiFeature = new ApiFetaures(productModel.find(), req.query)
    .paginate()
    .sort()
    .select()
  const Products = await apiFeature.mongooseQuery

  // pagination
  //     const { page, size } = req.query
  //     const { limit, skip } = paginateion({ page, size })
  //   const mongooseQuery = productModel.find().limit(limit).skip(skip) // mongoose  query
  // sort
  //   const mongooseQuery = productModel
  //     .find()
  //     .sort(req.query.sort?.replaceAll(',', ' ')) // mongoose  query

  //   select
  //   const mongooseQuery = productModel
  //     .find()
  //     .select(req.query.fields?.replaceAll(',', ' '))

  // search
  //   const mongooseQuery = productModel.find({
  //     $or: [
  //       { name: { $regex: req.query.search, $options: 'i' } },
  //       { description: { $regex: req.query.search, $options: 'i' } },
  //     ],
  //   })

  // filters
  //   const queryRequest = { ...req.query }
  //   const execludeFields = ['page', 'size', 'sort', 'fields']
  //   execludeFields.forEach((param) => delete queryRequest[param])
  //   const queryData = JSON.parse(
  //     JSON.stringify(queryRequest).replace(
  //       /lt|lte|gt|gte|in|nin|eq|neq/g,
  //       (match) => `$${match}`,
  //     ),
  //   )
  //   const mongooseQuery = productModel.find(queryData)
  //   const Products = await mongooseQuery // executiion

  res.status(200).json({ message: 'Done', Products })
}
