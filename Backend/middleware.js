module.exports.isLoggedIn = function (req,res,next){
    if(req.user) {
        return next();
    }
    else {
        console.log(req.session);
        console.log(req.cookies);
        
        return res.json({message : "User is not present"});
    }
};

module.exports.isAdmin = function (req,res,next){
    if(req.user.role=='admin') {
        return next();
    }
    else {
        return res.status('403').json({message:"You are not authorized for this"});
    }
}



