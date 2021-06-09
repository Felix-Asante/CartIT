const express = require('express')
const router = express.Router()
const client = require('../middleware/authentication')

// CART CONTROLLER
const cartController = require('../Controllers/cartController')

// VIEW CART : GET
router.get('/add/:id',cartController.addCart)
router.get('/checkout/',cartController.viewCart)
router.get('/remove/:product',cartController.removeFromCart)
router.post('/updatecart/:quantity/:product',cartController.updateCart)
router.get('/checkout/payment/gateways',client.authenticated,cartController.checkOutPage)
router.post('/checkout/payment',client.authenticated,cartController.checkOutPagePost)
router.post('/checkout/paypal',client.authenticated,cartController.paypalCheckOut)
router.get('/checkout/sucess',client.authenticated,cartController.checkOutSucess)
router.get('/checkout/cancel',client.authenticated,cartController.checkOutCancel)
router.get('/view/productdetails',cartController.productDetailView)



module.exports =  router;
