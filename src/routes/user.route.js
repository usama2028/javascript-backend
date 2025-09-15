import  { Router } from "express"
import {
    changePassword,
    getUserInfo,
    getUserProfileInfo, 
    getWatchHistory, 
    loginUser, logOut, 
    RefreshAccessToken, 
    registerUser, 
    updateAvatarImage, 
    updateCoverImage, 
    updateProfile 
} from "../controllers/user.controller.js"
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
userRouter.route("/changePassword").post(verifyJWT,changePassword)
userRouter.route("/updateProfile").patch(verifyJWT,updateProfile)
userRouter.route("/updateCoverImage").patch(
    verifyJWT,
    upload.single("coverImage"),
    updateCoverImage
)
userRouter.route("/updateAvatar").patch(
    verifyJWT,
    upload.single("avatar"),
    updateAvatarImage
)
userRouter.route("/userInfo").get(verifyJWT,getUserInfo)
userRouter.route("/userChannel/:userName").get(verifyJWT,getUserProfileInfo)
userRouter.route("/watcHistory").get(verifyJWT,getWatchHistory)

export  {userRouter}