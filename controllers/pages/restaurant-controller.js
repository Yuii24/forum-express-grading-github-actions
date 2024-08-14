const { User, Comment, Restaurant, Category } = require('../../models')
// const { getOffset, getPagination } = require('../../helpers/pagination-helper')
const restaurantsServices = require('../../services/restaurant-services')

const resaturantsController = {
  getRestaurants: (req, res, next) => {
    restaurantsServices.getRestaurants(req, res, (err, data) => err ? next(err) : res.render('restaurants', data))
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: User },
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' }
      ] // 拿出關聯的 Category model
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")

        return restaurant.increment('viewCounts', { by: 1 })
      })
      .then(restaurant => {
        const isFavorited = restaurant.FavoritedUsers.some(f => f.id === req.user.id)
        const isLiked = restaurant.LikedUsers.some(l => l.id === req.user.id)

        res.render('restaurant', {
          restaurant: restaurant.toJSON(),
          isFavorited,
          isLiked
        })
      })
      .catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    const restaurantId = req.params.id
    return Promise.all([
      Restaurant.findByPk(req.params.id, {
        raw: true,
        nest: true,
        include: Category
      }),
      Comment.findAndCountAll({
        include: Restaurant,
        where: {
          restaurantId: restaurantId
        },
        nest: true,
        raw: true
      })
    ]).then(([restaurant, comment]) => {
      if (!restaurant) throw new Error("Restaurant didn't exist!")

      console.log(restaurant)
      console.log(comment)
      return res.render('dashboard', {
        restaurant,
        commentcounts: comment.count
      })
    })
      .catch(err => next(err))
  },
  getFeeds: (req, res, next) => {
    return Promise.all([
      Restaurant.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [Category],
        raw: true,
        nest: true
      }),
      Comment.findAll({
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant],
        raw: true,
        nest: true
      })
    ])
      .then(([restaurants, comments]) => {
        res.render('feeds', {
          restaurants,
          comments
        })
      })
      .catch(err => next(err))
  },
  getTopRestaurants: (req, res, next) => {
    return Restaurant.findAll({
      include: [{ model: User, as: 'FavoritedUsers' }]
    })
      .then(restaurants => {
        const result = restaurants
          .map(restaurants => ({
            ...restaurants.toJSON(),
            description: restaurants.description.substring(0, 50),
            favoritedCount: restaurants.FavoritedUsers.length,
            isFavorited: req.user && req.user.FavoritedRestaurants.some(fr => fr.id === restaurants.id)
          }))
          .sort((a, b) => b.favoritedCount - a.favoritedCount).slice(0, 10)

        return res.render('top-restaurants', { restaurants: result })
      })
      .catch(err => next(err))
  }
}

module.exports = resaturantsController
