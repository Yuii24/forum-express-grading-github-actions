const { Restaurant, Category } = require('../models')

const resaturantsController = {
  getRestaurants: (req, res) => {
    return res.render('restaurants')
  }
}

module.exports = resaturantsController
