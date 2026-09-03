const productModel=require("../models/productmodel")
async function list(req,res,next) {
    try{
        const products=await productModel.findall()
        res.status(200).json({
            products
        })
    }
    catch(err){
        next(err)
    }
}
module.exports={list}