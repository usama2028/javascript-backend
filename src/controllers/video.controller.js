
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const getAllVideos=asyncHandler( async(req,res)=>{
    // get all videos based on query,sort,pagination.
    const{page=1,limit=10,query,sortBy="createdBy",sortType="desc",userId}=req.query
    page=parseInt(page)
    limit=parseInt(limit)
    limit=Math.min(limit,100)

    const filter={};
    if (query) {
        filter.$or=[
            {title:{$regex:query,$options:"i"}},
            {description:{$regex:query,$options:"i"}}
        ]
    }
    if (userId) filter.owner=userId
    
    const sortOptions={}
    sortOptions[sortBy]=sortType==="asc" ? 1:-1

    const videos=await Video.find(filter)
    .populate("owner","fullName avatar userName")
    .sort(sortOptions)
    .skip((page-1)*limit)
    .limit(limit)

    const totalVideos=await Video.countDocuments(filter)
    return res.status(200).json(
        new ApiResponse(200,{
            videos,
            pagination:{
                totalVideos,
                page,
                limit,
                totalPages:Math.ceil(totalVideos/limit)
            }
        },"videos fetch successfully.")
    )

})


const publishVideo=asyncHandler( async(req,res)=>{
    // get video,upload to cloudinary,create video
    const {title,description}=req.body
    if (!title||!description) {
        throw new ApiError(400,"Title and Description are requird.")
    }
    const videoFileLocalPath=req.files?.videoFile[0]?.path
    const thumbnailLocalPath=req.files?.thumbnail[0]?.path
    if (!(videoFileLocalPath&&thumbnailLocalPath)) {
        throw new ApiError(400,"videoFile and thumbnail are required.")
    }
    const video=await uploadOnCloudinary(videoFileLocalPath)
    if (!video.secure_url) {
        throw new ApiError(400,"Failed to upload video on cloudinary.")
    }
    const thumbnail=await uploadOnCloudinary(thumbnailLocalPath)
    if (!thumbnail.secure_url) {
        throw new ApiError(400,"Failed to upload thumbnail on cloudinary.")
    }
    const uploadVideo=await Video.create({
        videoFile:video.secure_url,
        thumbnail:thumbnail.secure_url,
        owner:req.user?._id,
        title,
        description,
        duration:video?.duration
    })
    return res.status(201).json(
        new ApiResponse(201,uploadVideo,"video uploaded sucessfully.")
    )
})

const getVideoById=asyncHandler( async(req,res)=>{
    // get video by id
    const {videoId}=req.params
    if (!videoId) {
        throw new ApiError(400,"VideoId is required.")
    }
    const video=await Video.findById(videoId).populate("owner","fullName avatar userName")
    if (!video) {
        throw new ApiError(404,"Video not Found.")
    }
    return res.status(200).json(
        new ApiResponse(200,video,"SuccessFully Fetch video.")
    )
    
})

const updateVideo=asyncHandler( async(req,res)=>{
    // update video details like title,description,thumbnail.
    const {videoId}=req.params
    if (!videoId) {
        throw new ApiError(400,"VideoId is required.")
    }
    const video=await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404,"Video not found.")
    }
    if (req.user._id.toString()!== video.owner.toString()) {
        throw new ApiError(403,"Not allowed to update other user videos.")
    }
    const {title,description}=req.body
    const thumbnailLocalPath=req.file?.path
    let newThumbnailUrl=video.thumbnail

    if (thumbnailLocalPath) {
        const newThumbnail=await uploadOnCloudinary(thumbnailLocalPath)
        newThumbnailUrl=newThumbnail.secure_url
    }

    video.title=title ||video.title
    video.description=description||video.description
    video.thumbnail=newThumbnailUrl
    await video.save()

    return res.status(200).json(
        new ApiResponse(200,video,"Video updated successfully.")
    )

})

const deleteVideo=asyncHandler( async(req,res)=>{
    // delete video by id.
    const {videoId}=req.params
    if (!videoId) {
        throw new ApiError(400,"VideoId is required.")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found.")
    }
    if (video.owner.toString()!==req.user._id.toString()) {
        throw new ApiError(403,"you are not allowed to delete the video.")
    }
    await video.deleteOne()
    return res.status(200).json(
        new ApiResponse(200,null,"video successfully deleted.")
    )
})

const togglePublishStatus= asyncHandler(async(req,res)=>{
    // check video status first and than change it.
    const {videoId}=req.params
    if (!videoId) {
        throw new ApiError(400,"VideoId is required.")
    }
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"Video not found.")
    }
    if (video.owner.toString()!==req.user._id.toString()) {
        throw new ApiError(403,"Not allowed.")
    }
    video.isPublished=!video.isPublished
    await video.save()
    return res.status(200).json(
        new ApiResponse(200,video,"video status successfully changed.")
    )
    

})


export {
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}