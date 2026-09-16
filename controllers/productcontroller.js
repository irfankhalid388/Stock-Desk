const db=require("../config/db")
const productModel=require("../models/productmodel")
const stockmovementModel = require("../models/stockmovementmodel")
async function list(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || "";
        const category_id = req.query.category_id ? parseInt(req.query.category_id) : null;

        const result = await productModel.findall({ page, limit, search, category_id });
        res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}
function stripofcostprice( product,role){
    if(role==="staff"){
        const{cost_price, ...safe}=product
        return safe
    }
    return product
}
async function show(req,res,next) {
    try{
    const product=await productModel.showall(req.params.id)
    if(!product){
         return res.status(404).json({
            error:"product not found"
        })
    }
     const safeproduct=stripofcostprice(product,req.user.role)
    res.status(200).json({
       safeproduct
    })
}
catch(err){
    next(err)
}
}
async function create(req,res,next){
    try{
     const product=await productModel.createdata(req.body)
     res.status(201).json({
        product:stripofcostprice(product,req.user.role)
     })
    }
    catch(err){
        if(err.code=== "ER_DUP_ENTRY"){
         return res.status(409).json({
            error:"SKU_ALREADY_EXISTS" 
        })
      }
      next(err)
    }
    
}
async function update(req,res,next){
    try{
     const product= await productModel.updatedata(req.params.id,req.body)
     if(!product){
      return  res.status(404).json({error:"product not found"})
     }
     res.status(200).json({
        product
     })
    }
    catch(err){
     if(err.code=== "ER_DUP_ENTRY"){
         return res.status(409).json({
            error:"SKU_ALREADY_EXISTS" 
        })
      }
      next(err)
    }
}
async function remove(req,res,next){
    try{
    const produt= await productModel.softdelte(req.params.id)
    if(!produt){
         return res.status(404).json({ error: "PRODUCT_NOT_FOUND" });
    }
    res.status(204).send()
}
catch(err){
    next (err)
}
}
async function stockadjust(req,res,next){
    try{
    const id=req.params.id
    const{change_qty,reason,note}=req.body
    const result =await db.transaction(async(conn)=>{
        let okay;
        if(change_qty>0){
            okay=await productModel.incrementstock(conn,id,change_qty) 
        }
        else{
            okay=await productModel.decrementstock(conn,id,Math.abs(change_qty))
        }
        if(!okay){
            const err=new Error("INSUFFICIENT_STOCK_OR_NOT_FOUND")
            err.status=422
            throw err
        }
        await stockmovementModel.stock_movements(conn,{
            product_id: id,
                change_qty: change_qty,
                reason: reason,
                reference_id: null,
                user_id:req.user.id,
                note:note   
        }) 
      
    })
const product = await productModel.showall(id)
res.status(200).json({ product }) 
    }
    catch(err){
if(err.status === 422){
        return res.status(422).json({ error: err.message })
    }
    next(err)
    }
}
async function renderlist(req,res,next){
    try{
      const result= await productModel.findall({page:1,limit:10,search:""})
      res.render("products/list",{
        products:result
      })
    }
    catch(err){
       next(err)
    }
}
async function rendernewform(req,res,next){
try{ 
    res.render("products/form",{
        product:null
    })

}
catch(err){
next(err)
}
}
async function renderdeditform(req,res,next){
    try{
        const product = await productModel.showall(req.params.id)

        if (!product) {
            return res.status(404).send("Product not found")
        }

        res.render("products/form", {
            product: product,
        })
    }
    catch(err){
        next(err)
    }
}

module.exports={list,show,create,update,remove,stockadjust,renderlist,rendernewform,renderdeditform}
