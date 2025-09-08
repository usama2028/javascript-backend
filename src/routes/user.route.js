import  { Router } from "express"
import { loginUser, logOut, RefreshAccessToken, registerUser } from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"


const userRouter=Router()

userRouter.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)
userRouter.route("/login").post(loginUser)
userRouter.route("/refreshToken").post(RefreshAccessToken)
// secure Routes
userRouter.route("/logOut").post(verifyJWT,logOut)

export  {userRouter}