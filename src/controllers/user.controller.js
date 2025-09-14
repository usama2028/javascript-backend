import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

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
        },
        {
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
        const InCommingToken=req.cookies?.refreshToken ||req.body?.refreshToken
        if (!InCommingToken) {
            throw new ApiError(401,"UnAuthorized request.")
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

const changePassword=asyncHandler( async(req,res)=>{
    const{oldPassword,newPassword}=req.body
    if(!oldPassword||!newPassword){
        throw new ApiError(400,"Fileds are required.")
    }
    const user=await User.findById(req.user._id)
    const verifyPassword=await user.isPassordCorrect(oldPassword)
    if (!verifyPassword) {
        throw new ApiError(400,"wrong old password.")
    }
    user.password=newPassword
    await user.save({validateBeforeSave:false})
    return res.status(200)
    .json(
        new ApiResponse(200,{},"Password change Successfully.")
    )
})

const getUserInfo=asyncHandler( async(req,res)=>{
    return res.status(200).json(
        new ApiResponse(200,req.user,"Successfully getting user Information.")
    )
})

const updateProfile=asyncHandler( async(req,res)=>{
    const {email,fullName}=req.body
    if (!email||!fullName) {
        throw new ApiError(400,"All fields are required.")
    }

    const user=await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                email:email,
                fullName:fullName
            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")
    return res.status(200).json(
        new ApiResponse(200,user,"details updated successfully.")
    )

})

const updateAvatarImage=asyncHandler( async(req,res)=>{
    const avatarLocalPath=req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required.")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    if (!avatar.secure_url) {
        throw new ApiError(400,"Failed to upload.")
    }

    const user=await User.findById(req.user._id).select("-password -refreshToken")
    user.avatar=avatar.secure_url
    await user.save({validateBeforeSave:false})
    
    return res.status(200).json(
        new ApiResponse(200,user,"Avatar updated successfully.")
    )
})

const updateCoverImage=asyncHandler( async(req,res)=>{
    const coverImageLocalPath=req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400,"Cover image is required.")
    }
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage.secure_url) {
        throw new ApiError(400,"failed to uplaod on cloudinary.")
    }

    const user=await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                coverImage:coverImage.secure_url
            }
        },
        {new:true}
    ).select("-password -refreshToken")

    res.status(200).json(
        new ApiResponse(200,user,"coverImage updated sucessfully.")
    )
})


const getUserProfileInfo=asyncHandler( async(req,res)=>{
    const userName=req.params
    if (!userName?.trim()) {
        throw new ApiError(400,"User name is missing.")
    }
    const channel=await User.aggregate([
        {
            $match:{
                userName:userName.toLowerCase()
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $lookup:{
                from:"subscriptions",
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribed"
            }
        },
        {
            $addFields:{
                subcsribersCount:{
                    $size:"$subscribers"
                },
                subscribedCounts:{
                    $size:"$subscribed"
                },
                isSubscribed:{
                    $cond:{
                        $if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                        $then:true,
                        $else:false
                    }
                }
            }
        },
        {
            $project:{
                userName:1,
                fullName:1,
                email:1,
                coverImage:1,
                avatar:1,
                subcsribersCount:1,
                subscribedCounts:1,
                isSubscribed:1
            }
        }
    ])
    if (!channel?.length) {
        throw new ApiError(400,"channel does not exists.")
    }
    return res.status(200).json(
        new ApiResponse(200,channel[0],"User profile fetched sucessfully.")
    )

})

const getWatchHistory=asyncHandler( async(req,res)=>{
    const user =await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(String(req.user._id))
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"WatcHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        userName:1,
                                        fullName:1,
                                        avatar:1

                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            $first:"$owner"
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200,user[0].watcHistory,"watch history fetched sucessfully.")
    )
})


export {
    registerUser,
    loginUser,
    logOut,
    RefreshAccessToken,
    changePassword,
    getUserInfo,
    updateProfile,
    updateAvatarImage,
    updateCoverImage,
    getUserProfileInfo,
    getWatchHistory
}
