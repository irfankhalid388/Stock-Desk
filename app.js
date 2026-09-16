// const express=require("express")
// const app=express()
// app.get("/",(req,res)=>{
//     res.json({status:"okay"})
// })
// module.exports=app;
const path=require("path")
const express=require("express")
const helmet=require("helmet")
const cookiepraser=require("cookie-parser")
const routes=require("./routes")
const{notFound,
    errorHandler
}=require("./middleware/errorhandler")
const app=express()
// for security secuirty headers first
app.use(helmet())
// parse json bodies
app.use(express.json())
// cookie praserto read cookies
app.use(cookiepraser())
// /api without this every request fall into notfound
app.use(express.static(path.join(__dirname, "public")))
// to serve static files 
app.use("/api", routes)
// to render ejs
app.get("/products", require("./controllers/productcontroller").renderlist)   
app.get("/products/new",require("./controllers/productcontroller").rendernewform)
app.get("/products/:id/edit",require("./controllers/productcontroller").renderdeditform)
// set ejs as server render view
app.set("view engine", "ejs")
// if nothing matced this will catch error
app.use(notFound)
// error handler must be at last to controll and treat errors with four params 
app.use(errorHandler)
module.exports=app