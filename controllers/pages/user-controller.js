const bcrypt = require('bcryptjs')
const { User, Comment, Restaurant, Favorite, Like, Followship } = require('../../models')
const { localFileHandler } = require('../../helpers/file-helpers')

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
  },
  addFavorite: (req, res, next) => {
    const { restaurantId } = req.params
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Favorite.findOne({
        where: {
          userId: req.user.id,
          restaurantId
        }
      })
    ])
      .then(([restaurant, favorite]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        if (favorite) throw new Error('You have favorited this restaurant!')

        return Favorite.create({
          userId: req.user.id,
          restaurantId
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFavorite: (req, res, next) => {
    return Favorite.findOne({
      where: {
        userId: req.user.id,
        restaurantId: req.params.restaurantId
      }
    })
      .then((favorite) => {
        if (!favorite) throw new Error("You haven't favorited this restaurant!")

        return favorite.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  addLike: (req, res, next) => {
    const { restaurantId } = req.params
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      Like.findOne({
        where: {
          userId: req.user.id,
          restaurantId
        }
      })
    ])
      .then(([restaurant, like]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        if (like) throw new Error('You have liked this restaurant!')

        Like.create({
          userId: req.user.id,
          restaurantId
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeLike: (req, res, next) => {
    return Like.findOne({
      where: {
        userId: req.user.id,
        restaurantId: req.params.restaurantId
      }
    })
      .then((like) => {
        if (!like) throw new Error("You haven't liked this restaurant!")

        return like.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  getTopUsers: (req, res, next) => {
    User.findAll({
      include: [{ model: User, as: 'Followers' }]
    })
      .then(users => {
        const result = users
          .map(user => ({
            ...user.toJSON(),
            followerCount: user.Followers.length,
            isFollowed: req.user.Followings.some(f => f.id === user.id)
          }))
          .sort((a, b) => b.followerCount - a.followerCount)

        // users = users.sort((a, b) => b.followerCount - a.followerCount)

        res.render('top-users', { users: result })
      })
      .catch(err => next(err))
  },
  addFollowing: (req, res, next) => {
    const { userId } = req.params
    return Promise.all([
      User.findByPk(userId),
      Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: req.params.userId
        }
      })
    ])
      .then(([user, followship]) => {
        if (!user) throw new Error("user didn't exist!")
        if (followship) throw new Error('You are already following this user!')

        return Followship.create({
          followerId: req.user.id,
          followingId: userId
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFollowing: (req, res, next) => {
    return Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then((followship) => {
        if (!followship) throw new Error("You haven't followed this user!")

        return followship.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  }
  // getTopRestaurants: (req, res, next) => {
  //   return Restaurant.findAll({
  //     include: [{ model: User, as: 'FavoritedUsers' }]
  //   })
  //     .then(restaurants => {
  //       const result = restaurants
  //         .map(restaurants => ({
  //           ...restaurants.toJSON(),
  //           description: restaurants.description.substring(0, 50),
  //           favoritedCount: restaurants.FavoritedUsers.length,
  //           isFavorited: req.user.FavoritedRestaurants.some(fr => fr.id === restaurants.id)
  //         }))
  //         .sort((a, b) => b.favoritedCount - a.favoritedCount).slice(0, 10)

  //       res.render('top-restaurants', { restaurants: result })
  //     })
  //     .catch(err => next(err))
  // }
}

module.exports = userController
