import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

const healthCheck=asyncHandler(async(req,res)=>{
    // build an health check response that simpy returns the ok status as json with a message.
    return res.status(200).json(
        new ApiResponse(200,{},"Every thing working right.")
    )
})

export { healthCheck }