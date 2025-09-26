
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Playlist } from "../models/playlist.model.js"


const createPlayList=asyncHandler(async(req,res)=>{
    // create playlist.
    const {name,description}=req.body
    if (!name || !description) {
        throw new ApiError(400,"Name and description is required.")
    }

    const existingPlaylist=await Playlist.findOne({owner:req.user?._id,name})
    if (existingPlaylist) {
        throw new ApiError(400,"you already have palylist with this name.")
    }

    const playlist=await Playlist.create({
        owner:req.user?._id,
        name,
        description
    })
    const response=await Playlist.findById(playlist._id)
    .populate("owner","fullName userName avatar")

    return res.status(201).json(
        new ApiResponse(201,response,"Playlist created successfully.")
    )
})

const getUserPlaylists=asyncHandler(async(req,res)=>{
    // get user playlists
    const {userId}=req.params
    if (!userId) {
        throw new ApiError(400,"UserId is required.")
    }

    const palylists=await Playlist.find({owner:userId})
    .populate("owner","fullName avatar userName")
    .populate("videos", "title thumbnail views duration")

    if (!palylists ||palylists.length===0) {
        throw new ApiError(404,"No Playlist found for this user.")
    }

    return res.status(200).json(
        new ApiResponse(200,palylists,"Playlists fetch sccuessfully.")
    )
})

const getPlaylistById=asyncHandler(async(req,res)=>{
    // get playlist by id
    const {playlistId}=req.params
    if (!playlistId) {
        throw new ApiError(400,"Playlist ID is required.")
    }
    const playlist=await Playlist.findById(playlistId)
    .populate("owner","fullName userName avatar")
    .populate("videos","title thumbnail duration views")

    if (!playlist) {
        throw new ApiError(404,"Playlist not found.")
    }
    return res.status(200).json(
        new ApiResponse(200,playlist,"playlist fetch successfully.")
    )

})

const addVideoToPlaylist=asyncHandler(async(req,res)=>{
    // add video to playlist.
    const {playlistId,videoId}=req.params
    if (!playlistId||!videoId) {
        throw new ApiError(400,"playlistId and videoId are requried.")
    }
    const playlist=await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404,"palylist not found")
    }
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400,"Video already exist in playlist.")
    }
    playlist.videos.push(videoId)
    await playlist.save()

    const updatedPlaylist=await Playlist.findById(playlistId)
    .populate("owner","fullName avatar userName")
    .populate("videos","title  thumbnail views duration")
    return res.status(200).json(
        new ApiResponse(200,updatedPlaylist,"video successfully added.")
    )
})

const removeVideoFromPlaylist=asyncHandler(async(req,res)=>{
    const {playlistId,videoId}=req.params
    // remove video from palylist
    if (!playlistId||!videoId) {
        throw new ApiError(400,"playlistId and videoId are required.")
    }
    const playlist=await Playlist.findByIdAndUpdate(
        playlistId,
        {$pull:{videos:videoId}},
        {new:true}
    )
    .populate("owner","userName fullName avatar")
    .populate("videos","title thumbnail views duration")

    if (!playlist) {
        throw new ApiError(404,"Playlist not found.")
    }
    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(404,"Video not exist in playlist.")
    }
    return res.status(200).json(
        new ApiResponse(200,playlist,"video removed from playlist successfully.")
    )
})

const deletePlaylist=asyncHandler(async(req,res)=>{
    // delete playlist.
    const {playlistId}=req.params
    if (!playlistId) {
        throw new ApiError(400,"PlaylistId is required.")
    }
    const playlist=await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404,"Playlist not found.")
    }
    if (playlist.owner.toString()!==req.user?._id.toString()) {
        throw new ApiError(403,"Not allowed to delete the playlist.")
    }
    playlist.deleteOne()

    return res.status(200).json(
        new ApiResponse(200,{},"playlist successfully deleted.")
    )
    
})

const updatePlaylist=asyncHandler(async(req,res)=>{
    const {playlistId}=req.params
    const {name,description}=req.body
    if (!playlistId) {
        throw new ApiError(400,"playlist id required.")
    }
    const playlist=await Playlist.findById(playlistId)
    .populate("owner","userName avatar fullName")
    .populate("videos","title duration views thumbnail")

    if (!playlist) {
        throw new ApiError(404,"Playlist not found.")
    }
    if (playlist.owner._id.toString()!==req.user?._id.toString()) {
        throw new ApiError(403,"Not allowed to update the playlist.")
    }
    if (!name&&!description) {
        throw new ApiError(400,"Atleast one field is required.")
    }
    playlist.name=name||playlist.name
    playlist.description=description||playlist.description
    await playlist.save()
    return res.status(200).json(
        new ApiResponse(200,playlist,"playlist updetad successfully.")
    )
})

export {
    createPlayList,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}