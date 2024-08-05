const bcrypt = require('bcryptjs')
const db = require('../models')
const { User } = db

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    if (req.body.password !== req.body.passwordCheck) { throw new Error('Password do not match!') }
    console.log(req.body.name)
    console.log(req.body.email)
    console.log(req.body.password)

    User.findOne({
      where: { email: req.body.email }
    })
      .then((user) => {
        if (user) { throw new Error('Email already exists!') }

        return bcrypt.hash(req.body.password, 10)
      })
      .then(hash => User.create({
        name: req.body.name,
        email: req.body.email,
        password: hash
      }))
      .then(() => {
        req.flash('succes_messages', '註冊成功!')
        res.redirect('/signin')
      })
      .catch(Err => next(Err))
  },
  signIpPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '登入成功')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功')
    req.logout()
    res.redirect('/signin')
  }
}

module.exports = userController
