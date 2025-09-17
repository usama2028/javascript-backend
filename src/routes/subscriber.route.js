
import { Router } from "express";
import {
    subscribe,
    unSubscribe,
    getChannelSubscribers,
    getSubscribedChannels 
} from "../controllers/subscriber.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()

router.route("/subscribe").post(verifyJWT,subscribe)
router.route("/unSubcribe").post(verifyJWT,unSubscribe)
router.route("/getChannelSubscribers/:channelId").get(verifyJWT,getChannelSubscribers)
router.route("/getSubscribedChannels").get(verifyJWT,getSubscribedChannels)

export default router