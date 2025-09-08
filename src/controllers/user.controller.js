import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"

const generateAccesstokenAndRefreshtoken=async (userId)=>{
    try {
        const user=await User.findById(userId)
        const access_token=await user.generateAccessToken()
        const refresh_token=await user.generateRefreshToken()

        user.refreshToken=refresh_token
        await user.save({ validateBeforeSave:false })
        return {access_token,refresh_token}
    } catch (error) {
        throw new ApiError(500,"Something went wrong wile creating access and refresh tokens")
    }
}


const registerUser=asyncHandler(async(req,res)=>{

    const { userName,email,password,fullName }=req.body

    if (
        [fullName,userName,email,password].some((field)=>field?.trim()==="")
    ) {
        throw new ApiError(400,"All Fields are Required.")
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format.");
}

    const existedUser=await User.findOne({
        $or:[{ email },{ userName }]
    })
    if (existedUser) {
        throw new ApiError(409,"User with this email or userName is already exists.")
    }

    const avatarLocalPath=req.files?.avatar?.[0]?.path;
    const coverImageLocalPath=req.files?.coverImage?.[0]?.path;


    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required.")
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar.secure_url) {
        throw new ApiError(400,"Failed to upload Avatar")
    }

    const user=await User.create({
        fullName,
        avatar:avatar.secure_url,
        coverImage:coverImage?.secure_url || "",
        userName,
        email,
        password
    })

    const createdUser=await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500,"something went wrong while user registeration.")
    }

    return res.status(201).json(
        new ApiResponse(201,createdUser,"user created sucessfully.")
    )

})

const loginUser=asyncHandler( async(req,res)=>{
    const {email,username,password}=req.body

    if (!(email||username)) {
        throw new ApiError(400,"username or email is required");
    }

    const user=await User.findOne({
        $or:[{email},{username}]
    })
    if (!user) {
        throw new ApiError(404,"user not exist.");
        
    }
    const verifyPassword=await user.isPassordCorrect(password)
    if (!verifyPassword) {
        throw new ApiError(403,"Invalid user credientials")
    } 
    const {access_token,refresh_token}=await generateAccesstokenAndRefreshtoken(user._id)

    const logedInUser= await User.findById(user._id).select("-password -refreshToken")

    const options={
        httpOnly:true,
        secure:true
    }

    res.status(200)
    .cookie("accessToken",access_token,options)
    .cookie("refreshToken",refresh_token,options)
    .json( new ApiResponse(
        200,
        {
            user:logedInUser,access_token,refresh_token
        },
        "User loged In successfully."
    ))

})


const logOut=asyncHandler( async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },{
            new:true
        }
    )
    const options={
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"User logOut successfully.")
    )

})

const RefreshAccessToken=asyncHandler( async(req,res)=>{
    try {
        const InCommingToken=cookies.refreshToken ||req.body.refreshToken ||req.header("Authorization").replace("Bearar ","")
        if (!InCommingToken) {
            throw new ApiError(401,"UnAuthorized")
        }
        const decoded_token=jwt.verify(InCommingToken,process.env.REFRESH_TOKEN_SECRET_KEY)
        const user=await User.findById(decoded_token._id)
        if (!user) {
            throw new ApiError(401,"InValid Refresh Token.")
        }
        if(InCommingToken!==user.refreshToken){
            throw new ApiError(401,"Refresh Token Expired or Not Matched.")
        }
        const {access_token,refresh_token}=await generateAccesstokenAndRefreshtoken(user._id)
    
        const options={
            httpOnly:true,
            secure:true
        }
        res.status(200)
        .cookie("accessToken",access_token,options)
        .cookie("refreshToken",refresh_token,options)
        .json(
            new ApiResponse(
                200,
                {
                    access_token,
                    refresh_token
                },
                "Access Token Refreshed."
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message ||"INvalid Refresh Token.")
    }

})

export {registerUser,loginUser,logOut,RefreshAccessToken}
