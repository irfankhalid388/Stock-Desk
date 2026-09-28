const categoryModel=require("../models/category")
// list////////////////////////////////////////////////////
async function list(req,res,next){
    try{
    const categories=await categoryModel.findall()
    res.status(200).json(categories)
    }
    catch(err){
        next(err)
    }
}
// create///////////////////////////////////////////////////////////////
async function create(req,res,next){
    try{
         if (!req.body.name || !req.body.name.trim()) {
      return res.status(422).json({ error: "Category name is required." });
    }
const add=await categoryModel.create({name:req.body.name.trim()})
res.status(201).json(add)
    }
    catch(err){
         if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "CATEGORY_ALREADY_EXISTS" });
    }
    next(err)
    }
}
module.exports={list,create}