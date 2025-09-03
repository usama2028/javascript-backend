import dotenv from "dotenv"
dotenv.config({
    path:"./.env"
})

import connectdb from "./db/index.js";
import { app } from "./app.js";



connectdb()
.then(()=>{
    app.listen(process.env.PORT||3000,()=>{
        console.log(`Server Running On http://localhost:${process.env.PORT||3000}`)
    })
})
.catch((error)=>{
    console.log("DATABASE CONNECTION FAILED!!!",error)
})