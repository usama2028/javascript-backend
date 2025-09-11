import  { Router } from "express"
import { changePassword, getUserInfo, loginUser, logOut, RefreshAccessToken, registerUser, updateAvatarImage, updateCoverImage, updateProfile } from "../controllers/user.controller.js"
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
userRouter.route("/updateProfile").post(verifyJWT,updateProfile)
userRouter.route("/updateCoverImage").post(
    upload.single("coverImage"),
    verifyJWT,
    updateCoverImage
)
userRouter.route("/updateAvatar").post(
    upload.single("avatar"),
    verifyJWT,
    updateAvatarImage
)
userRouter.route("/userInfo").get(verifyJWT,getUserInfo)

export  {userRouter}