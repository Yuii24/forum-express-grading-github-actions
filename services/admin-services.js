const { Restaurant, Category } = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')

const adminServices = {
  getRestaurants: (req, res, cb) => {
    Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurants => {
        return cb(null, { restaurants })
        // return res.render('admin/restaurants', { restaurants })
      })
      .catch(err => cb(err))
  },
  createRestaurant: (req, res, cb) => {
    return Category.findAll({
      raw: true
    })
      .then(categories => cb(null, { categories }))
      .catch(err => cb(err))
  },
  postRestaurants: (req, res, cb) => {
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
      .then(newRestaurant => cb(null, { restaurant: newRestaurant }))
      .catch(err => cb(err))
  },

  deleteRestaurant: (req, res, cb) => {
    Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")

        return restaurant.destroy()
      })
      .then(deletedRestaurant => cb(null, { restaurant: deletedRestaurant }))
      .catch(err => cb(err))
  }
}

module.exports = adminServices
