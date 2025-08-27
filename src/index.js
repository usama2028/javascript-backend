import dotenv from "dotenv"
import connectdb from "./db/index.js";
import { app } from "./app.js";

dotenv.config()

connectdb()
.then(app.listen(process.env.PORT || 80000),()=>{
    console.log(`SERVER RUNNING ON; http://localhost:${process.env.PORT || 80000}`)
})
.catch((error)=>{
    console.log("DATABASE CONNECTION FAILED!!!",error)
})