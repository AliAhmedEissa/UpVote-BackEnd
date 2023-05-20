import express from 'express'
import initApp from './src/utils/initiateApp.js'
import path from 'path'
import { config } from 'dotenv'
// import { createInvoice } from './src/utils/pdfkit.js'
config({ path: path.resolve('config/config.env') })

const app = express()

initApp(app, express)

