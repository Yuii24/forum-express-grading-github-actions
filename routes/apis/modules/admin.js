const express = require('express')
const router = express.Router()

const upload = require('../../../middleware/multer')

const adminController = require('../../../controllers/apis/admin-controller')
// const categoryController = require('../../../controllers/pages/category-controller')

router.get('/restaurants/create', adminController.createRestaurant)
router.delete('/restaurants/:id', adminController.deleteRestaurant)
router.get('/restaurants', adminController.getRestaurants)
router.post('/restaurants', upload.single('image'), adminController.postRestaurants)

module.exports = router
