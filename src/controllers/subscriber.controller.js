import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/apiResponse.js";

const subscribe=asyncHandler( async(req,res)=>{
    const {channelId}=req.body
    if(!channelId){
        throw new ApiError(400,"channel id is required.")
    }
    if(channelId===req.user._id.toString()){
        throw new ApiError(400,"you can not subscribe to you self.")
    }
    const existingSubscribe=await Subscription.find({
        subscriber:req.user._id,
        channel:channelId
    })
    if(existingSubscribe){
        throw new ApiError(400,"You alreday subscribe to this channel.")
    }
    const subscribe=await Subscription.create({
        subscriber:req.user._id,
        channel:channelId
    })

    return res.status(200).json(
        new ApiResponse(200,subscribe,"subscribed sucessfully.")
    )
})

const unSubscribe=asyncHandler( async(req,res)=>{
    const {channelId}=req.body
    if (!channelId) {
        throw new ApiError(400,"channel id is required.")
    }
   const unSubscribe=await Subscription.findOneAndDelete({
    subscriber:req.user._id.toString(),
    channel:channelId
   })

   if (!unSubscribe) {
    throw new ApiError(400,"you are not subscribed to this channel.")
   }

   return res.status(200).json(
    new ApiResponse(200,{},"successfully unSubscribed.")
   )
})

const getChannelSubscribers=asyncHandler( async(req,res)=>{
    const {channelId}=req.params
    if (!channelId) {
        throw new ApiError(400,"channel id is required.")
    }
    const subscribers=await Subscription
    .find({channel:channelId})
    .populate("subscriber","userName fullName avatar")

    return res.status(200).json(
        new ApiResponse(200,subscribers,"subscribers fetch successfully.")
    )
})

const getSubscribedChannels=asyncHandler( async(req,res)=>{
    const followingChannels=await Subscription
    .find({ subscriber:req.user._id})
    .populate("channel","userName fullName avatar")

    return res.status(200).json(
        new ApiResponse(200,followingChannels,"subscirbed channels fetched successfully.")
    )
})

export {
    subscribe,
    unSubscribe,
    getChannelSubscribers,
    getSubscribedChannels,
}