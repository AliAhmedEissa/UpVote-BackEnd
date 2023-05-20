import userModel from '../../../DB/model/User.model.js'

import pkg from 'bcryptjs'
import {
  tokenDecode,
  tokenGeneration,
} from '../../utils/GenerateAndVerifyToken.js'
import sendEmail from '../../utils/sendEmail.js'
import { customAlphabet } from 'nanoid'
const nanoId = customAlphabet('123456789', 6)
import { OAuth2Client } from 'google-auth-library'

//======================== signUp =======================
export const signUp = async (req, res, next) => {
  const { userName, email, password, phone, DOB } = req.body
  const emailEixsts = await userModel.findOne({ email }).select('_id email')
  if (emailEixsts) {
    return next(new Error('Email is Already Exists', { cause: 400 }))
  }
  const newUser = new userModel({
    userName,
    email,
    password,
    phone,
    DOB,
  })

  // confimation
  const token = tokenGeneration({
    payload: { _id: newUser._id, email: newUser.email },
  })({
    token,
  })
  if (!token) {
    return next(new Error('Token Generation Fail', { cause: 400 }))
  }
  const confirmationLink = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}`

  const message = `<a href= ${confirmationLink}>Click to confirm</a>`
  const sentEmail = await sendEmail({
    to: email,
    message,
    subject: 'Confirmation Email',
  })
  if (!sentEmail) {
    return next(new Error('Send Email Service Fails', { cause: 400 }))
  }
  await newUser.save()
  res
    .status(201)
    .json({ message: 'registration success , please confirm your email' })
}

//========================= confirmation Email ==================
export const confirmEmail = async (req, res, next) => {
  const { token } = req.params

  const decode = tokenDecode({ payload: token })
  if (!decode?._id) {
    return next(new Error('Decoding Fails', { cause: 400 }))
  }
  const userConfirmed = await userModel.findOneAndUpdate(
    { _id: decode._id, isConfirmed: false },
    {
      isConfirmed: true,
    },
  )
  if (!userConfirmed) {
    return next(
      new Error(
        'please check if you already confirm you email , if not please try to signup again',
        { cause: 400 },
      ),
    )
  }
  return res.status(200).json({ message: 'Your email confirmed', decode })
}

//=========================== Login =============================
export const login = async (req, res, next) => {
  const { email, password } = req.body
  const user = await userModel.findOne({ email, isConfirmed: true })
  if (!user) {
    return next(
      new Error(
        'please if enter a valid email or make sure that you confirm your email',
        { cause: 400 },
      ),
    )
  }
  const match = pkg.compareSync(password, user.password)
  if (!match) {
    return next(new Error('in-valid login information', { cause: 400 }))
  }
  const token = tokenGeneration({
    payload: {
      _id: user._id,
      email: user.email,
      isLoggedIn: true,
    },
  })
  await userModel.findOneAndUpdate({ email }, { isLoggedIn: true })
  return res.status(200).json({ message: 'Login Done', token })
}

//=========================== send code =======================
export const sendCode = async (req, res, next) => {
  const { email } = req.body
  const user = await userModel.findOne({ email, isConfirmed: true })
  if (!user) {
    return next(new Error('please sign up fisrt', { cause: 400 }))
  }
  // nanoid = hfj765765fhj
  const forgetCode = nanoId()
  // const message = `<p> OTP is ${forgetCode} </p>`
  const message = `<!DOCTYPE html>
    <html>
    <head>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"></head>
    <style type="text/css">
    body{background-color: #88BDBF;margin: 0px;}
    </style>
    <body style="margin:0px;"> 
    <table border="0" width="50%" style="margin:auto;padding:30px;background-color: #F3F3F3;border:1px solid #630E2B;">
    <tr>
    <td>
    <table border="0" width="100%">
    <tr>
    <td>
    <h1>
        <img width="100px" src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png"/>
    </h1>
    </td>
    <td>
    <p style="text-align: right;"><a href="http://localhost:4200/#/" target="_blank" style="text-decoration: none;">View In Website</a></p>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    <tr>
    <td>
    <table border="0" cellpadding="0" cellspacing="0" style="text-align:center;width:100%;background-color: #fff;">
    <tr>
    <td style="background-color:#630E2B;height:100px;font-size:50px;color:#fff;">
    <img width="50px" height="50px" src="${process.env.logo}">
    </td>
    </tr>
    <tr>
    <td>
    <h1 style="padding-top:25px; color:#630E2B">Forget password</h1>
    </td>
    </tr>
    <tr>
    <td>
    <p style="padding:0px 100px;margin:10px 0px 30px 0px ">  your verfication code is
    </p>
    </td>
    </tr>
    <tr>
    </tr>
    <tr>
    </tr>
    <tr>
    <td>
    <p style="margin:10px 0px 30px 0px;border-radius:4px;padding:10px 20px;border: 0;color:#fff;background-color:#630E2B;">${forgetCode}</p>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    <tr>
    <td>
    <table border="0" width="100%" style="border-radius: 5px;text-align: center;">
    <tr>
    <td>
    <h3 style="margin-top:10px; color:#000">Stay in touch</h3>
    </td>
    </tr>
    <tr>
    <td>
    <div style="margin-top:20px;">

    <a href="${process.env.facebookLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35062_erj5dx.png" width="50px" hight="50px"></span></a>
    
    <a href="${process.env.instegram}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group35063_zottpo.png" width="50px" hight="50px"></span>
    </a>
    
    <a href="${process.env.twitterLink}" style="text-decoration: none;"><span class="twit" style="padding:10px 9px;;color:#fff;border-radius:50%;">
    <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670703402/Group_35064_i8qtfd.png" width="50px" hight="50px"></span>
    </a>
    </div>
    </td>
    </tr>
    </table>
    </td>
    </tr>
    </table>
    </body>
    </html>`
  const sentEmail = await sendEmail({
    to: email,
    message,
    subject: 'Forget Password',
  })
  if (!sentEmail) {
    return next(new Error('Send Email Service Fails', { cause: 400 }))
  }
  const saved = await userModel.findOneAndUpdate(
    { email },
    { forgetCode },
    { new: true },
  )
  return res.status(200).json({ message: 'OTP sent successfully', saved })
}

//========================== reset password ===============================
export const resetPassword = async (req, res, next) => {
  const { email, forgetCode, newPassword } = req.body
  const user = await userModel.findOne({ email })
  if (!user) {
    return next(new Error('please sign up fisrt', { cause: 400 }))
  }
  if (user.forgetCode != forgetCode) {
    return next(new Error('in-valid OTP', { cause: 400 }))
  }
  // const hashedPass = pkg.hashSync(newPassword, +process.env.SALT_ROUNDS)
  // const updatedUser = await userModel.findOneAndUpdate({ email }, {
  //     password: hashedPass,
  //     forgetCode: null
  // }, {
  //     new: true
  // })
  // if (!updatedUser) {
  //     return next(new Error('please sign up fisrt', { cause: 400 }))
  // }
  user.forgetCode = null
  user.password = newPassword
  user.changePassword = Date.now()
  const userUpdated = await user.save()
  return res.status(200).json({ message: 'please login', userUpdated })
}

export const loginWithGmail = async (req, res, next) => {
  const client = new OAuth2Client(process.env.CLIENT_ID)
  const { idToken } = req.body
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
    })
    const payload = ticket.getPayload()
    return payload
  }
  //passport.js
  const { email, name, picture, email_verified } = await verify()
  if (!email_verified) {
    return next(new Error('in-valid email', { cause: 400 }))
  }
  const user = await userModel.findOne({ email, provider: 'GOOGLE' })
  //login
  if (user) {
    const token = tokenGeneration({
      payload: {
        _id: user._id,
        email: user.email,
        isLoggedIn: true,
      },
    })
    await userModel.findOneAndUpdate({ email }, { isLoggedIn: true })
    return res.status(200).json({ message: 'Login Done', token })
  }

  //signUp
  const newUser = new userModel({
    userName: name,
    email,
    password: nanoId(),
    isConfirmed: true,
    isloggedIn: true,
    provider: 'GOOGLE',
    Image:picture,
  })
  const token = tokenGeneration({
    payload: { _id: newUser._id, email: newUser.email, isloggedIn: true },
  })
  await newUser.save()
  res.status(201).json({ message: 'registration success', token })
  //   return res.status(200).json({ messge: 'd', token })
}
