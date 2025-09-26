import { Router } from "express";
import {
    addComment,
    updateComment,
    deleteComment,
    getAllComments
} from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()

router.use(verifyJWT)
router.route("/create/:videoId").post(addComment)
router.route("/update/:commentId").patch(updateComment)
router.route("/getComments/:videoId").get(getAllComments)
router.route("/delete/:commentId").delete(deleteComment)

export default router