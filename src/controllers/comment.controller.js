import {Comment} from "../models/coment.model.js"
import { ApiError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const getAllComments=asyncHandler( async(req,res)=>{
    // get all comments for a video.
    const {videoId}=req.params
    if (!videoId) {
        throw new ApiError(400,"videoId is required.")
    }
    let {page=1,limit=10}=req.query
    limit=parseInt(limit)
    page=parseInt(page)

    const totalComments=await Comment.countDocuments({video:videoId})

    const comments=await Comment.find({video:videoId})
    .populate("owner","userName avatar fullName")
    .populate("video","title duration views thumbnail")
    .skip((page-1)*limit)
    .limit(limit)

    return res.status(200).json(
        new ApiResponse(200,{
            comments,
            pagination:{
                totalComments,
                currentPage:page,
                totalPages:Math.ceil(totalComments/limit)
            }
        },
        "Comments fetch successfully.")
    )
})

const addComment=asyncHandler(async(req,res)=>{
    // add comment to a video.
    const {videoId}=req.params
    if (!videoId) {
        throw new ApiError(400,"videoId is required.")
    }
    const {content}=req.body
    if (!content) {
        throw new ApiError(400,"content is required.")
    }
    const comment=await Comment.create({
        video:videoId,
        owner:req.user._id,
        content
    })
    
    const response=await Comment.findById(comment._id)
    .populate("owner","fullName avatar userName")
    .populate("video","title thumbnail views duration")

    return res.status(201).json(
        new ApiResponse(201,response,"comment created successfully.")
    )
})

const updateComment=asyncHandler(async(req,res)=>{
    // update a comment
    const {commentId}=req.params
    if (!commentId) {
        throw new ApiError(400,"CommentId is required.")
    }
    const {newContent}=req.body
    if (!newContent) {
        throw new ApiError(400,"content is required.")
    }
    const updatedComment=await Comment.findByIdAndUpdate(
        commentId,
        {
            $set:{
                content:newContent
            }
        },
        {new:true}
    )
    .populate("owner","userName avatar fullName")
    .populate("video","title thumbnail duration views")

    if (!updatedComment) {
        throw new ApiError(404,"comment not found.")
    }

    return res.status(200).json(
        new ApiResponse(200,updatedComment,"comment updated successfully.")
    )
})

const deleteComment=asyncHandler(async(req,res)=>{
    // delete comment
    const {commentId}=req.params
    if (!commentId) {
        throw new ApiError(400,"CommentId is required.")
    }
    const comment=await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404,"Comment not found")
    }
    if (comment.owner.toString()!==req.user._id.toString()) {
        throw new ApiError(403,"not allowed to delete.")
    }
    await comment.deleteOne()
    return res.status(200).json(
        new ApiResponse(200,{},"comment deleted sucessfully.")
    )
})

export {
    addComment,
    updateComment,
    deleteComment,
    getAllComments
}
