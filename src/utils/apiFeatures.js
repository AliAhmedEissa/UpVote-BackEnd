class ApiFetaures {
  constructor(mongooseQuery, queryData) {
    this.mongooseQuery = mongooseQuery
    this.queryData = queryData
  }
  //  sort,search,filter,pagination,fields
  //pagination
  paginate() {
     (this.queryData)
    let { page, size } = this.queryData
    if (page < 1 || !page) page = 1
    if (size < 1 || !size) size = 2

    const limit = parseInt(size)
    const skip = (parseInt(page) - 1) * parseInt(size)
    this.mongooseQuery.limit(limit).skip(skip)
    return this
  }
  // sort
  sort() {
    this.mongooseQuery.sort(this.queryData.sort?.replaceAll(',', ' ')) // mongoose  query
    return this
  }
  select() {
    this.mongooseQuery.select(this.queryData.fields?.replaceAll(',', ' ')) // mongoose  query
    return this
  }
  filter() {
    const queryRequest = { ...this.queryData }
    const execludeFields = ['page', 'size', 'sort', 'fields']
    execludeFields.forEach((param) => delete queryRequest[param])
    const queryData = JSON.parse(
      JSON.stringify(queryRequest).replace(
        /lt|lte|gt|gte|in|nin|eq|neq/g,
        (match) => `$${match}`,
      ),
    )
    this.mongooseQuery.find(queryData)
    return this
  }
}

export default ApiFetaures
// new Error('')
