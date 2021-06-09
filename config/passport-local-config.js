const passport =require('passport')
const LocalStrategy = require('passport-local').Strategy
const DB = require('./dbConfig')
const bcrypt = require('bcryptjs')



passport.serializeUser(function(user, done) {
  done(null, user.emai);
});

passport.deserializeUser(function(email, done) {
  DB.query('SELECT * FROM CartIt.Customers WHERE email=?',email, function(err,user){
    if(err){ return done(err)}
    else{
      user[0].role = 'BASIC'
      console.log("de:",user[0])
      return done(null,user[0])
      }
  })
});

// * AUTH METHOD
  function AuthenticateUser(email,password,done){
    const sql ='SELECT * FROM CartIt.Customers WHERE email=?'
    DB.query(sql,email, async function(err,user){

        if(err)
        {
         return done(err)
        }

        if(user.length==0)
        {
         
          return done(null,false,{message:'No account with this email was found'})
        }
        else if(user[0].password==null){
          return done(null,user[0])
        }
        else{
          if(await bcrypt.compare(password,user[0].password))
          {
            return done(null,user[0])
          }
          else{
          return done(null,false,{message:'Invalid password'})
          }
        }
    }
  )

    
}


function localStrategy(){

  passport.use(new LocalStrategy({usernameField:'email',passwordField:'password'},AuthenticateUser))
}

module.exports = localStrategy;