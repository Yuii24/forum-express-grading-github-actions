const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const admin = require('./modules/admin')
const restsController = require('../controllers/restaurants-controller')
const restController = require('../controllers/restaurant-controller')
const userController = require('../controllers/user-controller')
const adminController = require('../controllers/admin-controller')

const { authenticated, authenticatedAdmin } = require('../middleware/auth')
const { generalErrorHandler } = require('../middleware/error-handler')

router.use('/admin', authenticatedAdmin, admin)
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)

router.get('/signin', userController.signIpPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)

router.get('/logout', userController.logout)

router.get('/restaurants/:id', authenticated, restController.getRestaurant)
router.get('/restaurants/:id/dashboard/', authenticated, restController.getDashboard)

router.get('/restaurants', authenticated, restsController.getRestaurants)
router.get('/user', authenticated, adminController.getUsers)

router.use('/', (req, res) => {
  res.redirect('/restaurants')
})

router.use('/', generalErrorHandler)

module.exports = router
