const passport = require('passport')
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const DB = require('./dbConfig.js')
let sql;

passport.serializeUser((newCustomer,done)=> done(null,newCustomer.email))
passport.deserializeUser((newCustomer,done)=>{
  sql = 'SELECT * FROM CartIt.Customers WHERE email = ?'
  DB.query(sql,newCustomer, function(err,user){
    if(err)
    {
      console.log(err)
       done(err,null)
    }
    else{
      user[0].role = 'BASIC'
       done(null,user[0])
    }
  })
  // done(null,newCustomer)
})

module.exports = function googleStrategy(){
  passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:'http://localhost:4000/user/google/callback'
  },
   function(token,tokenSecret,profile,done){

     sql = 'SELECT * FROM CartIt.Customers WHERE email=?'
      DB.query(sql, profile._json.email, function(err,customer){
       
        console.log(Object.assign({},customer[0]))
          if(err)
          {
            return done(err)
          }

        if(customer.length<=0)
        {
            sql = 'INSERT INTO CartIt.Customers SET ? '
            const newCustomer = {firstName:profile.name.givenName,lastName:profile.name.familyName,email:profile._json.email,password:null}
            DB.query(sql,newCustomer, (err,row)=>{
                if(err)
                {
                  return done(err)
                }
                else
                {
                  return done(null,newCustomer)
                }

            })
        }
        else
        {
          return done(null,Object.assign({},customer[0]))
        }
     })

    //  done(null,profile)

   }
  ))
}
