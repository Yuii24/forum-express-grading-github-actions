const { Restaurant, Category } = require('../models')

const resaturantsController = {
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: Category // 拿出關聯的 Category model
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")

        return restaurant.increment('viewCounts', { by: 1 })

          .then(restaurant => res.render('restaurant', {
            restaurant: restaurant.toJSON()
          }))
      })
      .catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: Category
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")

        console.log(restaurant)
        return res.render('dashboard', { restaurant })
      })

      .catch(err => next(err))
  },
  getRestaurants: (req, res, next) => {
    const categoryId = Number(req.query.categoryId) || ''

    // 下方的展開運算值內容等與這兩行:
    // 『 const where = {}
    //    if (categoryId) where.categoryId = categoryId  』

    return Promise.all([
      Restaurant.findAll({
        include: Category,
        where: {
          ...categoryId ? { categoryId } : {}
        },
        nest: true,
        raw: true
      }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurants, categories]) => {
        const data = restaurants.map(r => ({
          ...r,
          description: r.description.substring(0, 50)
        }))
        return res.render('restaurants', {
          restaurants: data,
          categories,
          categoryId
        })
      })
      .catch(err => next(err))
  }
}

module.exports = resaturantsController
