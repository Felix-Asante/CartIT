const express = require('express')
const router = express.Router()
const passport = require('passport')
const userController = require('../Controllers/clientController')
const client = require('../middleware/authentication')

// * @DESC render client login page
// * GET  user/loginpage
router.get('/login',client.checkAuthentication, userController.userLoginPage)

// * Normal Login
router.post('/login', passport.authenticate('local',{failureRedirect:'/user/login',failureFlash:true,successRedirect:'/'}))

// * @DESC RENDER CREATE ACCOUNT
// * GET user/createaccount
router.get('/createaccount',client.checkAuthentication,userController.createaccount)
// * CREATE NEW ACCOUNT : POST
router.post('/create/newaccount',userController.createNewAccount)
router.get('/create/newaccount', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'] }))

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/user/createaccount' }),
  function(req, res) {
    res.redirect('/');
  });

  
module.exports = router;
