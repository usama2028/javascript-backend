import { ascyncHandler } from "../utils/asyncHandler.js";

const registerUser=ascyncHandler(async(req,res)=>{
    res.status(200).json({
        message:"ok",
    })
})

export {registerUser}