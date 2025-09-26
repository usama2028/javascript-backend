import { Router } from "express";
import { 
    getAllVideos,
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus

} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()

router.route("/uploadVideo").post(
    verifyJWT,
    upload.fields([
        {
            name:"videoFile",
            maxCount:1
        },
        {
            name:"thumbnail",
            maxCount:1
        }
    ]),
    publishVideo
)
router.route("/getVideos").get(
    verifyJWT,
    getAllVideos
)
router.route("/getVideo/:videoId").get(verifyJWT,getVideoById)
router.route("/updateVideo/:videoId").patch(verifyJWT,updateVideo)
router.route("/deleteVideo/:videoId").delete(verifyJWT,deleteVideo)
router.route("/togglePublishStatus/:videoId").patch(verifyJWT,togglePublishStatus)

export default router