function authenticated(req,res,next){
    if (req.isAuthenticated())
    return next();
    res.redirect('/user/login')
}

function checkAuthentication(req,res,next){
    if(req.isAuthenticated() ){
        res.redirect("back")
    }
    else{

        next()
    }
}

// * ADMIN AUTHENTICATION
function authenticateAdmin(req,res,next){
    if(req.session.admin){
        next()
    }
    else{

        res.status(401).redirect('/admin/login')
    }
}

function checkAdminAuth(req,res,next){
    if(req.session.admin){
        res.redirect('/admin/')
    }
    else{

        next()
    }
}

module.exports = {
    authenticated,
    checkAuthentication,
    authenticateAdmin,
    checkAdminAuth,
}