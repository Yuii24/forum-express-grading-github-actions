const restaurantsServices = require('../../services/restaurant-services')

const resaturantsController = {
  getRestaurants: (req, res, next) => {
    restaurantsServices.getRestaurants(req, res, (err, data) => err ? next(err) : res.json({ status: 'success', data }))
  }
}

module.exports = resaturantsController
