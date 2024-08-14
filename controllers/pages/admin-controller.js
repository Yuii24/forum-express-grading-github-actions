const { Restaurant, User, Category } = require('../../models')
const { localFileHandler } = require('../../helpers/file-helpers')
const adminServices = require('../../services/admin-services')

const adminController = {
  getRestaurants: (req, res, next) => {
    adminServices.getRestaurants(req, res, (err, data) => err ? next(err) : res.render('admin/restaurants', data))
  },
  // getRestaurants: (req, res, next) => {
  //   Restaurant.findAll({
  //     raw: true,
  //     nest: true,
  //     include: [Category]
  //   })
  //     .then(restaurants => {
  //       res.render('admin/restaurants', { restaurants })
  //     })
  //     .catch(err => next(err))
  // },
  createRestaurant: (req, res, next) => {
    return Category.findAll({
      raw: true
    })
      .then(categories => res.render('admin/create-restaurant', { categories }))
      .catch(err => next(err))
  },
  postRestaurants: (req, res, next) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    if (!name) throw new Error('Restaurant name is required!')

    // 等於 cost file = req.file/
    const { file } = req

    localFileHandler(file).then(filePath => {
      return Restaurant.create({
        name: name,
        tel: tel,
        address: address,
        openingHours: openingHours,
        description: description,
        image: filePath || null,
        categoryId: categoryId
      })
    })
      .then(() => {
        req.flash('success_messages', 'restaurant was successfully created')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
  },
  getRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")

        res.render('admin/restaurant', { restaurant })
      })
      .catch(err => next(err))
  },
  editRestaurant: (req, res, next) => {
    return Promise.all([
      Restaurant.findByPk(req.params.id, { raw: true }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurant, categories]) => {
        if (!restaurant) throw new Error("Restaurant doesn't exist!")
        res.render('admin/edit-restaurant', { restaurant, categories })
      })
      .catch(err => next(err))
  },
  putRestaurant: (req, res, next) => {
    const { file } = req
    const { name, tel, address, openingHours, description, categoryId } = req.body
    if (!name) throw new Error('Restaurant name is required!')

    Promise.all([
      Restaurant.findByPk(req.params.id),
      localFileHandler(file)
    ]).then(([restaurant, filePath]) => {
      if (!restaurant) throw new Error("Restaurant didn't exist!")

      return restaurant.update({
        name: name,
        tel: tel,
        address: address,
        openingHours: openingHours,
        description: description,
        image: filePath || restaurant.image,
        categoryId: categoryId
      })
        .then(() => {
          req.flash('success_messages', 'restaurant was successfully to update')
          res.redirect('/admin/restaurants')
        })
        .catch(err => next(err))
    })
  },
  deleteRestaurant: (req, res, next) => {
    adminServices.deleteRestaurant(req, res, (err, data) => err ? next(err) : res.redirect('/admin/restaurants', data))
  },
  // deleteRestaurant: (req, res, next) => {
  //   Restaurant.findByPk(req.params.id)
  //     .then(restaurant => {
  //       if (!restaurant) throw new Error("Restaurant didn't exist!")

  //       return restaurant.destroy()
  //     })
  //     .then(() => res.redirect('/admin/restaurants'))
  //     .catch(err => next(err))
  // },
  getUsers: (req, res, next) => {
    return User.findAll({
      raw: true
    })
      .then(users => {
        res.render('admin/admin-user', { users })
      })
      .catch(err => next(err))
  },
  patchUser: (req, res, next) => {
    return User.findByPk(req.params.id)
      .then(user => {
        if (user.email === 'root@example.com') {
          req.flash('error_messages', '禁止變更 root 權限')
          return res.redirect('back')
        }

        if (!user.isAdmin) {
          return user.update({
            isAdmin: true
          })
            .then(() => {
              req.flash('success_messages', '使用者權限變更成功')
              return res.redirect('/admin/users')
            })
            .catch(err => next(err))
        }
        return user.update({
          isAdmin: false
        })
          .then(() => {
            req.flash('success_messages', '使用者權限變更成功')
            return res.redirect('/admin/users')
          })
          .catch(err => next(err))
      })
      .catch(err => next(err))
  }
}

module.exports = adminController
