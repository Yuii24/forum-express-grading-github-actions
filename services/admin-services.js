const { Restaurant, Category } = require('../models')
// const { localFileHandler } = require('../helpers/file-helpers')

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
