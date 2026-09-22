const customerModel=require("../models/customermodel")
const db=require("../config/db")
/////////////////////////////////// list
async function list(req,res,next) {
    try{
const search=req.query.search ||""
const page=parseInt(req.query.page) || 1
const limit=parseInt(req.query.limit) || 20
const result=await customerModel.findall({search,page,limit})
res.status(200).json({
    rows:result.rows,
    total:result.total,
    page,
    pages:Math.ceil(result.total/limit) || 1
})
}
catch(err){
next(err)
}
}
// SHOW/////////////////////////////////////////////////////////////
async function show(req,res,next){
    try{
    const result=await customerModel.showall(req.params.id)
    if(!result){
         return res.status(404).json({
            error:"CUSTOMER_NOT_FOUND"
    })
    }
    res.status(200).json(result)
    }
    catch(err){
        next(err)
    }
}
// CREATE///////////////////////////////////////////////////////////////
async function create(req,res,next) {
    try{
    const id=await customerModel.createdata(req.body)
    res.status(200).json(id)
    }
    catch(err){
 if(err.code=== "ER_DUP_ENTRY"){
         return res.status(409).json({
            error:"CUSTOMER_ALREADY_EXISTS" 
        })
      }
      next(err)
    }
}
// UPDATE//////////////////////////////////////////////////
async function update(req,res,next) {
    try{
       const customer = await customerModel.updatedata(req.body, req.params.id);
       if(!customer){
         return res.status(404).json({error:"CUSTOMER_NOT_FOUND"})
       }
       res.status(200).json(customer)
    }
    catch(err){
next(err)
    }
}
// CUSTOMER INVOICE DATA
async function customerinvoicedata(req,res,next){
    try{
    const results=await customerModel.findwithinvoicetotals(req.params.id)
    if(!results){
         return res.status(404).json({
            error:"RESULTS_NOT_FOUND"
        })
    }
    res.status(200).json(results)
    }
    catch(err){
next(err)
    }
}
module.exports={list,create,update,show,customerinvoicedata}