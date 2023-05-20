
import multer from 'multer'

export const allowedExtensions = {
    image: ['image/jpeg', 'image/png', 'image/gif'],
    file: ['application/pdf', 'application/msword'],
    video: ['video/mp4']
}
export function fileUpload({ customValidation = allowedExtensions.image } = {}) {
    const storage = multer.diskStorage({})
    function fileFilter(req, file, cb) {
        if (customValidation.includes(file.mimetype)) {
            return cb(null, true)
        }
        return cb('In-valid file format', false)
    }
    const upload = multer({ fileFilter, storage })
    return upload
}