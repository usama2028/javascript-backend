import { ascyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudnary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js"



// get data from frontend
// check validation empty fields
// chech for unique user
// check for images,check for avatar
// uplaod them on coudinary
// create user entry in db
// remove a password and refresh token
// check for user creation
// return user

const registerUser=ascyncHandler(async(req,res)=>{

    const { userName,email,password,fullName }=req.body
    console.log(email)

    if (
        [fullName,userName,email,password].some((field)=>field?.trim()==="")
    ) {
        throw new ApiError(400,"All Fields are Required.")
    }
    if(!email.inculde("@")){
        throw new ApiError(400,"Invalid email format.")
    }

    const existedUser=User.findOne({
        $or:[{ email },{ userName }]
    })
    if (existedUser) {
        throw new ApiError(409,"User with this email or userName is already exists.")
    }

    const avatarLocalPath=requestAnimationFrame.files?.avatar[0]?.path;
    const coverImageLocalPath=req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required.")
    }

    const avatar=await uploadOnCloudnary(avatarLocalPath)
    const coverImage=await uploadOnCloudnary(coverImageLocalPath)
    if (!avatar) {
        throw new ApiError(400,"Avatar file is required.")
    }

    const user=await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        userName,
        email,
        password
    })

    const createdUser=await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500,"something went wrong while user registeration.")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"user created sucessfully.")
    )

})
export {registerUser}