require('dotenv').config()
const app=require('./app');
const db=require('./config/db')
const port=process.env.PORT||3000

db.ping()
  .then(()=>{
    app.listen(port,()=>{
        console.log(`the server is running on port ${port}`)
    })
  })
  .catch((err)=>{
    console.error("Database connection failed:", err.message)
    process.exit(1)
  })
