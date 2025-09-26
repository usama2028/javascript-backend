
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
import { ApiError } from "./utils/apiError.js";
import commentRouter from "./routes/comment.route.js"
import  healthCheckRouter  from "./controllers/healthCare.controller.js";
import likeRouter from "./routes/like.route.js"
import playlistRouter from "./routes/playlist.route.js"
import tweetRouter from "./routes/tweet.route.js"

app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/subscription",SubscriptionRoutes)
app.use("/api/v1/comments",commentRouter)
app.use("/api/v1/",healthCheckRouter)
app.use("/api/v1/likes",likeRouter)
app.use("/api/v1/playlist",playlistRouter)
app.use("/api/v1/tweets",tweetRouter)



app.use((err,req,res,next)=>{
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success:false,
            message:err.message,
            errors:err.errors,
            stack:process.env.NODE_ENV==="develpoment"?err.stack:null
        })
    }
    return res.status(500).json({
        success:false,
        message:err.message,
        stack:process.env.NODE_ENV==="development"?err.stack:null
    })
})

export { app }