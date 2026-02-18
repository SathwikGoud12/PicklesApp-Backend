require("dotenv").config();

const app = require("./src/app");
const connectDb = require("./src/config/Db");

connectDb()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server is running at port: ${process.env.PORT}`);
    })
})
.catch((error)=>{
  console.log("MongoDb Connection is Failed",error)
})