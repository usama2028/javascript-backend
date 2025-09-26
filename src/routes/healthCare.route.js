
import { Router } from "express";
import { healthCheck } from "../controllers/healthCare.controller.js"

const router=Router()

router.route("/checkHealth").get(healthCheck)

export default router