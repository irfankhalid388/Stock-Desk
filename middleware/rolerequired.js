function rolerequired(...allowed){
    return async  function (req,res,next){
     if(!req.user){
      return  res.status(401).json({
            error:"TOKEN_MISSING"
        })
     }
     if(!allowed.includes(req.user.role)){
       return res.status(403).json({
            error:"FORBIDDEN"
        })
     }
     next()
    
}
}
module.exports={rolerequired}