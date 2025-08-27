
import express from "express";
import cors from "cors";
import cookieparse from "cookie-parse";

const app =express()

app.use(cors({
        origin:process.env.CORS_ORIGIN,
        credentials:true
    }))
    
app.use(cookieparse())

app.use(express.json({limit:"15kb"}))
app.use(express.urlencoded({extended:true,limit:"15kb"}))
app.use(express.static("public"))


export { app }