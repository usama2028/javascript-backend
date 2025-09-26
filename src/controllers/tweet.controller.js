import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiResponse } from "../utils/apiResponse.js";

const createTweet=asyncHandler(async(req,res)=>{
    const {content}=req.body
    if (!content) {
        throw new ApiError(400,"Content is required.")
    }
    const tweet=await Tweet.create({
        owner:req.user._id,
        content:content
    })
    return res.status(201).json(
        new ApiResponse(201,tweet,"Tweet created successfully.")
    )
})

const getUserTweets=asyncHandler(async(req,res)=>{
    const {userId}=req.params
    if (!userId) {
        throw new ApiError(400,"userId is required.")
    }
    // get user tweets
    const tweet=await Tweet.find({owner:userId})
    if (tweet.length===0) {
        throw new ApiError(404,"Tweets not found.")
    }
    return res.status(200).json(
        new ApiResponse(200,tweet,"successfully fetch user tweets.")
    )
})

const updateTwet=asyncHandler(async(req,res)=>{
    // update tweet.
    const {tweetId}=req.params
    if (!tweetId) {
        throw new ApiError(400,"Tweet id is required.")
    }
    const { content}=req.body
    if (!content) {
        throw new ApiError(400,"content is required.")
    }
    const tweet=await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404,"Tweet not found.")
    }
    if (tweet.owner.toString()!==req.user._id.toString()) {
        throw new ApiError(403,"Not allowed to update others tweet.")
    }
    tweet.content=content
    await tweet.save()
    return res.status(200).json(
        new ApiResponse(200,tweet,"Tweet successfully updated.")
    )
})

const deleteTweet=asyncHandler(async(req,res)=>{
    const {tweetId}=req.params
    if (!tweetId) {
        throw new ApiError(400,"tweet id is required.")
    }
    const tweet=await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(400,"Tweet not found.")
    }
    if (req.user._id.toString()!==tweet.owner.toString()) {
        throw new ApiError(403,"Not allowed to delete others tweet.")
    }
    await tweet.deleteOne()
    return res.status(200).json(
        new ApiResponse(200,null,"tweet deleted successfully.")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTwet,
    deleteTweet
}