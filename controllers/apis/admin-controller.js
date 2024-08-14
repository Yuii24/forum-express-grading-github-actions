const adminServices = require('../../services/admin-services')

const adminController = {
  getRestaurants: (req, res, next) => {
    adminServices.getRestaurants(req, res, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  deleteRestaurant: (req, res, next) => {
    adminServices.deleteRestaurant(req, res, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}

module.exports = adminController
