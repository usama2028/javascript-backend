import { Router } from "express";
import {
    createPlayList,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from  "../controllers/playlist.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router=Router()
router.use(verifyJWT)

router.route("/").post(createPlayList)
router.route("/user/:userId").get(getUserPlaylists)

router.route("/:playlistId/videos/:videoId")
.post(addVideoToPlaylist)
.delete(removeVideoFromPlaylist)

router.route("/:playlistId")
.get(getPlaylistById)
.patch(updatePlaylist)
.delete(deletePlaylist)

export default router