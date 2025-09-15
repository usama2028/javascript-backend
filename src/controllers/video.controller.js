
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const uploadVideo= asyncHandler( async (req,res)=>{
    const {thumbnail,title,description,}=req.body
    if(!thumbnail||!title||!description){
        throw new ApiError(400,"All fields are required")
    }

    const videoFileLocalPath=req.file?.path
    if (!videoFileLocalPath) {
        throw new ApiError(400,"Video file is requied.")
    }
    const videoFile=await uploadOnCloudinary(videoFileLocalPath)
    if (!videoFile.secure_url) {
        throw new ApiError(400,"Failed to upload video on cloudinary.")
    }


    const video=await Video.create(
        {
            videoFile:videoFile.secure_url,
            thumbnail,
            title,
            description,
            duration:videoFile?.duration
        }
    ) 

    return res.status(200).json(
        new ApiResponse(200,video,"video upload sucessfully.")
    )
})

export { uploadVideo }