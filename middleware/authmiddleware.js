const { verifyaccess } = require("../utils/token")

async function authrequired(req,res,next){
    const autheader=req.headers.authorization
    if(!autheader){
     return res.status(401).json({
        error:"TOKEN_MISSING"
     })
    }
    const parts=autheader.split(" ")
    if(parts.length!==2 ||
       parts[0]!=="Bearer" 
    )
    {
       return res.status(401).json({
            error:"TOKEN_INVALID "
            
        })
    }
    const token=parts[1]
    try{
        const payload= await verifyaccess(token)
       req.user={id:payload.id,role:payload.role}
       return next()
    }
    catch(err){
        if(err.name==="TokenExpiredError"){
           return res.status(401).json({
                error:"TOKEN_EXPIRED"
            })
        }
        else{
           return res.status(401).json({
                error:"TOKEN_INVALID"
                
            })
        }
    }



}
module.exports={authrequired}