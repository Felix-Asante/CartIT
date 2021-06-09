
const bcrypt = require('bcryptjs')
let sql;
const DB = require('../config/dbConfig')

// * @DESC render client login
const userLoginPage = (req,res)=>{
    res.status(200).render('login',{title:'Login',usernameField:'none',action:"/user/login"})
}
// * @DESC render client signup
const createaccount = (req,res)=>{
    res.status(200).render('signup')
}
// * CREATE ACCOUNT POST
const createNewAccount = async (req,res)=>{
  const customer ={firstName:req.body.firstName,lastName:req.body.lastName,email:req.body.email}

  customer.password = await bcrypt.hash(req.body.password,10)

  sql= 'INSERT INTO CartIt.Customers SET ?'

  DB.query(sql,customer, function(err,rows){
    if(err) throw err;

    res.redirect('/')
  })

}


module.exports ={
    userLoginPage,
    createaccount,
    createNewAccount,
}
