
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app =express()

app.use(cors({
        origin:process.env.CORS_ORIGIN,
        credentials:true
    }))
    
app.use(cookieParser())

app.use(express.json({limit:"15kb"}))
app.use(express.urlencoded({extended:true,limit:"15kb"}))
app.use(express.static("public"))

// import routers
import {userRouter} from "./routes/user.route.js"
import videoRouter from "./routes/video.route.js"
import SubscriptionRoutes from "./routes/subscriber.route.js";


app.use("/api/v1/users/",userRouter)
app.use("/api/v1/video/",videoRouter)
app.use("/api/v1/subscription/",SubscriptionRoutes)

export { app }