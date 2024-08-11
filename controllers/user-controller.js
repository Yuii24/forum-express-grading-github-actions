const bcrypt = require('bcryptjs')
const { User, Comment, Restaurant } = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')

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
  },
  getUser: (req, res, next) => {
    return User.findByPk(req.params.id, {
      include: [
        {
          model: Comment,
          include: [
            {
              model: Restaurant,
              attributes: ['image', 'name']
            }
          ]
        }
      ]
    })
      .then(user => {
        if (!user) throw new Error("User didn't exist.")
        const comment = user.Comments ? user.Comments : []

        res.render('users/profile', {
          user: user.toJSON(),
          comment
        })
      })
      .catch(err => next(err))
  },
  // 想請助教幫我確認一下為什麼下面的程式碼跑test會出現 TypeError: Cannot read properties of null (reading 'args') //
  //   return Promise.all([
  //     User.findByPk(req.params.id, {
  //       include: Comment
  //     }),
  //     Comment.findAndCountAll({
  //       include: [
  //         User,
  //         Restaurant
  //       ],
  //       where: {
  //         userId: req.params.id
  //       },
  //       raw: true,
  //       nest: true
  //     })
  //   ]).then(([user, comment]) => {
  //     if (!user) throw new Error("User didn't exist!")
  //     return res.render('users/profile', {
  //       user: user.toJSON(),
  //       commentcounts: comment.count,
  //       comment: comment.rows
  //     })
  //   })
  //     .catch(err => next(err))
  // },
  editUser: (req, res, next) => {
    const userId = req.params.id
    return User.findByPk(userId, {
      raw: true,
      nest: true
    })
      .then((user) => {
        if (!user) throw new Error("User didn't exist!")

        console.log(user)
        return res.render('users/edit', { user })
      })
      .catch(err => next(err))
  },
  putUser: (req, res, next) => {
    const { name } = req.body
    const { file } = req
    if (!name) throw new Error('User name is required!')

    return Promise.all([
      User.findByPk(req.params.id),
      localFileHandler(file)
    ]).then(([user, filePath]) => {
      if (!user) throw new Error("User didn't exist!")

      return user.update({
        name: name,
        image: filePath || user.image
      })
        .then(() => {
          req.flash('success_messages', '使用者資料編輯成功')
          res.redirect(`/users/${user.id}`)
        })
        .catch(err => next(err))
    })
  }
}

module.exports = userController
