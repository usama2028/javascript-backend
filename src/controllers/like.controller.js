import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError.js"
import { Like } from "../models/like.model.js"
import { ApiResponse } from "../utils/apiResponse.js";


const getLikedVideos=asyncHandler(async(req,res)=>{
    // get all liked videos.
    let {page=1,limit=10}=req.query
    page=parseInt(page)
    limit=parseInt(limit)

    const totalikeVideos=await Like.countDocuments({
        likedBy:req.user._id,
        video:{$exists:true}
    })

    const likedVideos=await Like.find({
        likedBy:req.user._id,
        video:{$exists:true}
    })
    .populate("likedBy","fullName avatar userName")
    .populate("video","title thumbnail duration views")
    .limit(limit)
    .skip((page-1)*limit)
 
    const videos=likedVideos.map((like)=>like.video)

    if (!likedVideos||likedVideos.length===0) {
        return res.status(200).json(
            new ApiResponse(200,[],"No liked vidoes found.")
        )
    }

    return res.status(200).json(
        new ApiResponse(200,{
            videos,
            pagination:{
                totalikeVideos,
                currentPage:page,
                totalPages:Math.ceil(totalikeVideos/limit)
            }
        },"liked videos fetch successfully.")
    )
})

const toggleTweetLike=asyncHandler(async(req,res)=>{
    // toggle like on a tweet.
    const {tweetId}=req.params
    if (!tweetId) {
        throw new ApiError(400,"Tweet id is required.")    
    }
    const existingLike=await Like.findOne({
        tweet:tweetId,
        likedBy:req.user._id
    })
    if (existingLike) {
        await existingLike.deleteOne()
        res.status(200).json(
            new ApiResponse(200,{},"Tweet unlike successfully.")
        )
    }else{
        const like=await Like.create({
            tweet:tweetId,
            likedBy:req.user._id
        })
        const response=await Like.findById(like?._id)
        .populate("likedBy","userName fullName avatar")
        .populate("tweet","owner content")

        return res.status(201).json(
            new ApiResponse(200,response,"tweet successfully liked.")
        )
    }
})

const toggleCommentLike=asyncHandler(async(req,res)=>{
    // toggle like on a comment.
    const {commentId}=req.params
    if (!commentId) {
        throw new  ApiError(400,"CommentId is required.")
    }
    const existingCommentLike=await Like.findOne({
         comment:commentId,
         likedBy:req.user._id
    })
    if (existingCommentLike) {
        await existingCommentLike.deleteOne()
        return res.status(200).json(
            new ApiResponse(200,{},"comment unliked successfully.")
        )
    }else{
        const likeOnComment=await Like.create({
            comment:commentId,
            likedBy:req.user._id
        })
        const response=await Like.findById(likeOnComment._id)
        .populate("comment","owner content")
        .populate("likedBy","avatar userName fullName")

        return res.status(201).json(
            new ApiResponse(201,response,"comment liked successfully.")
        )
    }
})

const toggleVideoLike=asyncHandler(async(req,res)=>{
    // toggle like on a video.
    const {videoId}=req.params
    if (!videoId) {
        throw new ApiError(400,"VideoId is required.")
    }
    
    const existingVideoLike=await Like.findOne({
         video:videoId,
         likedBy:req.user._id
    })
    if (existingVideoLike) {
        await existingVideoLike.deleteOne()
        return res.status(200).json(
            new ApiResponse(200,{},"video unliked successfully.")
        )
    }else{
        const likeOnVideo=await Like.create({
            video:videoId,
            likedBy:req.user._id
        })
        const response=await Like.findById(likeOnVideo._id)
        .populate("video","title thumbnail duration views")
        .populate("likedBy","avatar userName fullName")

        return res.status(201).json(
            new ApiResponse(201,response,"video liked successfully.")
        )
    }

})

const getLikedComments=asyncHandler( async(req,res)=>{
    let {page=1,limit=10}=req.query
    page=parseInt(page)
    limit=parseInt(limit)

    const totaLikedComments=await Like.countDocuments({
        likedBy:req.user._id,
        comment:{$exists:true}
    })

    const userlikedComments=await Like.find({
        likedBy:req.user._id,
        comment:{$exists:true}
    })
    .populate("likedBy","userName fullName avatar")
    .populate("comment","content owner")
    .limit(limit)
    .skip((page-1)*limit)

    if (!userlikedComments||userlikedComments.length===0) {
        new ApiResponse(200,[],"user not liked any comment.")
    }
    const comments=userlikedComments.map((like)=>like.comment)

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                comments,
                pagination:{
                totaLikedComments,
                currentPage:page,
                totalPages:Math.ceil(totaLikedComments/limit)
            }
        },
        "successfully fetched liked comments."
    )
    )

})

const getlikedTweets=asyncHandler(async(req,res)=>{
    let {page=1,limit=10}=req.query
    page=parseInt(page)
    limit=parseInt(limit)

    const totaLikedTweets=await Like.countDocuments({
        likedBy:req.user._id,
        tweet:{$exists:true}
    })
    const userLikedTweets=await Like.find({likedBy:req.user._id,tweet:{$exists:true}})
    .populate("likedBy","userName fullName avatar")
    .populate("tweet","content owner")
    .limit(limit)
    .skip((page-1)*limit)

    if (!userLikedTweets||userLikedTweets.length===0) {
        return res.status(200).json(
            new ApiResponse(200,[],"user not liked any tweet.")
        )
    }

    const tweets=userLikedTweets.map((like)=>like.tweet)
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                tweets,
                pagination:{
                    totaLikedTweets,
                    currentPage:page,
                    totalPges:Math.ceil(totaLikedTweets/limit)
                }
            },"successfully fetched liked tweets."
        )
    )

})


export {
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    getLikedVideos,
    getLikedComments,
    getlikedTweets
}