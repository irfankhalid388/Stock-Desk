const reportModel=require("../models/reportmodel")
const productModel=require("../models/productmodel")
// GET SUMMARY/////////////////////////////////////////////////////////////////////
async function summary(req,res,next) {
    try{
    const {format,to}=req.query
    const result=await reportModel.getreport(format,to)
    const result1=await reportModel.gettopproducts(format,to)
    res.status(200).json({...result,top_products:result1})
    }
catch(err){
next(err)
}
}
// GET TOP EMPLOYEES/////////////////////////////////////////////////////////////////////
async function gettopemployees(req,res,next){
    try{
     const{from,to}=req.body
     const result=await reportModel.saleperperson(from,to)
     res.status(200).json(result)
    }
    catch(err){
    next(err)
    }
}
// GET LOW STOCK ////////////////////////////////////////////////////////
async function getlowstock(req,res,next){
    try{
    const result=await productModel.findlowsstock()
    res.status(200).json(result)
    }
    catch(err){
next(err)
    }
}
module.exports={summary,getlowstock,gettopemployees}