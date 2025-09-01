import dotenv from "dotenv"
import connectdb from "./db/index.js";
import { app } from "./app.js";

dotenv.config()

connectdb()
.then(()=>{
    app.listen(process.env.PORT||3000,()=>{
        console.log(`Server Running On http://localhost:${process.env.PORT||3000}`)
    })
})
.catch((error)=>{
    console.log("DATABASE CONNECTION FAILED!!!",error)
})