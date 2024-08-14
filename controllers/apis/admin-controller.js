const adminServices = require('../../services/admin-services')

const adminController = {
  getRestaurants: (req, res, next) => {
    adminServices.getRestaurants(req, res, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  createRestaurant: (req, res, next) => {
    adminServices.createRestaurant(req, res, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },
  postRestaurants: (req, res, next) => {
    adminServices.postRestaurants(req, res, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  },

  deleteRestaurant: (req, res, next) => {
    adminServices.deleteRestaurant(req, res, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}

module.exports = adminController
