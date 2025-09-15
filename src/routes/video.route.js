import { Router } from "express";
import { uploadVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router=Router()

router.route("/uploadVideo").post(
    upload.single("videoFile"),
    uploadVideo
)

export default router