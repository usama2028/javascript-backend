import { Router } from "express";
import {
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    getLikedVideos,
    getLikedComments,
    getlikedTweets
} from "../controllers/like.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()
router.use(verifyJWT)

router.route("/videos").get(getLikedVideos)
router.route("/comments").get(getLikedComments)
router.route("/tweets").get(getlikedTweets)
router.route("/video/:videoId").post(toggleVideoLike)
router.route("/comment/:commentId").post(toggleCommentLike)
router.route("/tweet/:tweetId").post(toggleTweetLike)

export default router