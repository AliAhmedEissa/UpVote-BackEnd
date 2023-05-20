
import path from 'path'
import { config } from 'dotenv'
config({ path: path.resolve('config/config.env') })

import cloudinary from 'cloudinary';

cloudinary.v2.config({
    api_key: process.env.api_key,
    api_secret: process.env.api_secret,
    cloud_name: process.env.cloud_name,
    secure: true
})

export default cloudinary.v2;