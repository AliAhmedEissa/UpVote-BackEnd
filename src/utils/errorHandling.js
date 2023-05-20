


let stackVar;
const asyncHandler = (API) => {
    return (req, res, next) => {
        API(req, res, next).catch(err => {
            stackVar = err.stack
            // return res.status(500).json({ message: "Catch error", error: err.message })
            return next(new Error(err.message, { cause: 500 }))
        })
    }
}

const globalResponse = (err, req, res, next) => {
    if (err) {
        if (process.env.ENV_MODE === 'DEV') {
            return res.status(err['cause'] || 500).json({ message: "Fail Response", error: err.message, stack: stackVar })
        }
        return res.status(err['cause'] || 500).json({ message: "Fail in Response", error: err.message })

    }
}

export {
    asyncHandler,
    globalResponse
}
