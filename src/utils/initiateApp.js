import chalk from 'chalk'
import morgan from 'morgan'
import connectDB from '../../DB/connection.js'
import * as Routers from '../index.router.js'
import { globalResponse } from './errorHandling.js'
import cors from 'cors'
const initApp = (app, express) => {
  const port = process.env.PORT || 5000
  // cors policy
  var whitelist = ['http://example1.com', 'http://example2.com']
  //convert Buffer Data
  // app.use(express.json({}))
  app.use((req, res, next) => {
    if (req.originalUrl == '/order/webhook') {
      next()
    } else {
      express.json({})(req, res, next)
    }
  })
  if (process.env.ENV_MODE == 'DEV') {
    app.use(cors())
    app.use(morgan('dev'))
  } else {
    // private network to public network
    app.use(async (req, res, next) => {
      if (!whitelist.includes(req.header('origin'))) {
        return next(new Error('Not allowed by CORS', { cause: 502 }))
      }
      await res.header('Access-Control-Allow-Origin', '*')
      await res.header('Access-Control-Allow-Header', '*')
      await res.header('Access-Control-Allow-Method', '*')
      await res.header('Access-Control-Allow-Private-Network', 'true')
      next()
    })
    app.use(morgan('combined'))
  }
  //connect to DB
  connectDB()
  //Setup API Routing
  app.use(`/auth`, Routers.authRouter)
  app.use(`/user`, Routers.userRouter)
  app.use(`/product`, Routers.productRouter)
  app.use(`/category`, Routers.categoryRouter)
  app.use(`/subCategory`, Routers.subcategoryRouter)
  app.use(`/reviews`, Routers.reviewsRouter)
  app.use(`/coupon`, Routers.couponRouter)
  app.use(`/cart`, Routers.cartRouter)
  app.use(`/order`, Routers.orderRouter)
  app.use(`/brand`, Routers.branRouter)
  // in-valid routings
  app.all('*', (req, res, next) => {
    res.json('In-valid Routing Plz check url  or  method')
  })
  // fail reposne
  app.use(globalResponse)

  app.listen(port, () =>
    console.log(
      chalk.blue.bgWhite.bold(`Example app listening on port ${port}!`),
    ),
  )
}
// NER //

export default initApp
